package suatgpt.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import suatgpt.backend.model.ChatSession;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.ChatMessageRepository;
import suatgpt.backend.repository.ChatSessionRepository;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.service.AiService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin // 处理跨域请求
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    public AiController(AiService aiService,
                        UserRepository userRepository,
                        ChatSessionRepository sessionRepository,
                        ChatMessageRepository messageRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }

    // 定义请求与响应数据结构
    public record ChatRequest(String message, String modelKey, Long sessionId) {}
    public record CreateSessionRequest(String title) {}
    public record SessionResponse(Long id, String title, LocalDateTime createdAt) {}
    public record MessageResponse(String sender, String content, LocalDateTime timestamp) {}

    /**
     * 获取会话列表
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getSessions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        List<SessionResponse> sessions = sessionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(s -> new SessionResponse(s.getId(), s.getTitle(), s.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(sessions);
    }

    /**
     * 创建新会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> createSession(@AuthenticationPrincipal UserDetails userDetails, @RequestBody CreateSessionRequest body) {
        User user = getUser(userDetails);
        ChatSession session = new ChatSession(user, body.title());
        ChatSession saved = sessionRepository.save(session);
        return ResponseEntity.ok(new SessionResponse(saved.getId(), saved.getTitle(), saved.getCreatedAt()));
    }

    /**
     * 获取历史消息记录
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<MessageResponse>> getSessionHistory(@PathVariable Long sessionId) {
        List<MessageResponse> messages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId).stream()
                .map(m -> new MessageResponse(m.getSender(), m.getContent(), m.getTimestamp()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    /**
     * 核心流式对话端点
     * 路由逻辑已下沉至 aiService.streamProcessWithSession
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ChatRequest request) {
        // 设置超时为 10 分钟，以应对长文档 RAG 的潜在延迟
        SseEmitter emitter = new SseEmitter(600000L);
        User user = getUser(userDetails);

        try {
            // 调用重写后的 AiService，传入 modelKey（涵盖七个模型分支）
            aiService.streamProcessWithSession(
                    user,
                    request.sessionId(),
                    request.message(),
                    request.modelKey(), // 对应 application.yml 中的 7 个 key
                    emitter
            );
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    /**
     * 新增：文件上传同步端点
     * 将文件推送到 AnythingLLM 进行向量化处理
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "文件不能为空"));
        }

        // 这里的上传逻辑依赖于 AiService 中对 anything-llm 的配置注入
        boolean success = aiService.uploadAndEmbed(file);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "文件已同步至 SUAT 知识库，模型现在已获得该文档背景"));
        } else {
            // 失败通常是由于后端 API 连接不通或内存溢出
            return ResponseEntity.status(500).body(Map.of("message", "同步失败，请检查服务器 AnythingLLM 服务状态"));
        }
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}