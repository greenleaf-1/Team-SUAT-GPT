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
     * 已加入原生 IO 存档逻辑，确保数据永久化
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ChatRequest request) {
        // 设置超时为 10 分钟
        SseEmitter emitter = new SseEmitter(600000L);
        User user = getUser(userDetails);

        // --- 极简本地存档逻辑开始 ---
        // 地址：backend/src/main/java/suatgpt/backend/controller/AiController.java
        try {
            // 使用当前系统目录，确保在 Linux 服务器上也能准确创建
            String logDir = System.getProperty("user.dir") + java.io.File.separator + "logs";
            java.nio.file.Path logPath = java.nio.file.Paths.get(logDir, "extraction_history.log");

            // 自动创建文件夹，防止服务器权限或目录不存在导致报错
            java.nio.file.Files.createDirectories(logPath.getParent());

            String logInfo = String.format("[%s] 用户: %s | 会话ID: %s | 课题: %s%n",
                    LocalDateTime.now(), user.getUsername(), request.sessionId(), request.message());

            java.nio.file.Files.write(
                    logPath,
                    logInfo.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.APPEND
            );
        } catch (Exception e) {
            System.err.println("服务器存档失败: " + e.getMessage());
        }
        // --- 极简本地存档逻辑结束 ---

        try {
            aiService.streamProcessWithSession(
                    user,
                    request.sessionId(),
                    request.message(),
                    request.modelKey(),
                    emitter
            );
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    /**
     * 新增：读取本地存档记录
     * 地址：backend/src/main/java/suatgpt/backend/controller/AiController.java
     */
    @GetMapping("/extraction-history")
    public ResponseEntity<List<String>> getExtractionHistory() {
        try {
            java.nio.file.Path logPath = java.nio.file.Paths.get(System.getProperty("user.dir"), "logs", "extraction_history.log");
            if (!java.nio.file.Files.exists(logPath)) {
                return ResponseEntity.ok(List.of("暂无存档记录"));
            }
            // 读取最后 50 行记录，防止文件过大导致内存溢出
            List<String> allLines = java.nio.file.Files.readAllLines(logPath);
            int start = Math.max(0, allLines.size() - 50);
            return ResponseEntity.ok(allLines.subList(start, allLines.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of("读取存档失败: " + e.getMessage()));
        }
    }

    /**
     * 新增：文件上传同步端点
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "文件不能为空"));
        }

        boolean success = aiService.uploadAndEmbed(file);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "文件已同步至 SUAT 知识库，模型现在已获得该文档背景"));
        } else {
            return ResponseEntity.status(500).body(Map.of("message", "同步失败，请检查服务器 AnythingLLM 服务状态"));
        }
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}