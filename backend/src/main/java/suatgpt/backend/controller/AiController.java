package suatgpt.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter; // 新增 Import

import suatgpt.backend.model.ChatMessage;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.service.AiService;
import suatgpt.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.net.InetAddress;
import java.net.URI;
import java.net.Socket;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

/**
 * AI 交互控制器
 * 负责处理与 AI 聊天、获取历史记录等操作的 API 路由。
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;

    public AiController(AiService aiService, UserRepository userRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    // --- DTOs (Data Transfer Objects) ---

    /**
     * 聊天请求体 (DTO): 接收用户发送的消息内容 和 选择的模型键。
     */
    record ChatRequest(String message, String modelKey) {}

    /**
     * 聊天消息响应体 (DTO): 用于向客户端发送聊天消息的简化结构。
     */
    record MessageResponse(String sender, String content, LocalDateTime timestamp) {}

    // --- API Endpoints ---

    /**
     * [NEW] 流式聊天接口
     * 前端通过 fetch + ReadableStream 调用此接口，实现打字机效果。
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChatRequest request) {

        // 1. 设置超时时间 (3分钟，防止深度思考模型超时)
        SseEmitter emitter = new SseEmitter(3 * 60 * 1000L);

        // 2. 获取用户 (复用之前的逻辑)
        User user = getUser(userDetails);

        // 3. 校验输入
        if (request.message() == null || request.message().trim().isEmpty()) {
            try {
                emitter.send("消息内容不能为空");
                emitter.complete();
            } catch (Exception e) { }
            return emitter;
        }

        // 4. 开始流式处理 (调用 AiService 的新方法)
        try {
            // 注意：请确保你的 AiService 已经添加了 streamProcessUserMessage 方法
            aiService.streamProcessUserMessage(user.getId(), request.message(), request.modelKey(), emitter);
        } catch (Exception e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    /**
     * [保留] 普通聊天接口 (非流式)
     * 发送新消息并获取 AI 响应 (等待全部生成完才返回)
     */
    @PostMapping("/chat")
    public ResponseEntity<MessageResponse> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChatRequest request) {
        
        if (request.message() == null || request.message().trim().isEmpty()) {
             return ResponseEntity.badRequest().body(new MessageResponse("AI", "消息内容不能为空。", LocalDateTime.now()));
        }
        
        User user = getUser(userDetails);

        // 调用 AiService 处理用户消息
        String aiResponse = aiService.processUserMessage(user.getId(), request.message(), request.modelKey());

        return ResponseEntity.ok(new MessageResponse("AI", aiResponse, LocalDateTime.now()));
    }

    /**
     * 获取聊天历史记录
     */
    @GetMapping("/history")
    public ResponseEntity<List<MessageResponse>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));

        List<ChatMessage> history = aiService.getChatHistory(user.getId());

        List<MessageResponse> response = history.stream()
                .map(msg -> new MessageResponse(msg.getSender(), msg.getContent(), msg.getTimestamp()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * 测试与指定 AI 模型的网络连通性
     */
    @GetMapping("/test")
    public ResponseEntity<?> testAiConnection(@RequestParam(required = false, defaultValue = "qwen-public") String modelKey) {
        String baseUrl;
        switch (modelKey) {
            case "qwen-internal":
                baseUrl = aiService.qwenInternalBaseUrl();
                break;
            case "deepseek":
                baseUrl = aiService.deepseekBaseUrl();
                break;
            case "qwen-public":
            default:
                baseUrl = aiService.qwenPublicBaseUrl();
                break;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("modelKey", modelKey);
        result.put("baseUrl", baseUrl);

        try {
            URI uri = new URI(baseUrl);
            String host = uri.getHost();
            int port = uri.getPort() == -1 ? ("https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80) : uri.getPort();
            result.put("host", host);
            result.put("port", port);

            InetAddress[] addrs = InetAddress.getAllByName(host);
            String[] ips = new String[addrs.length];
            for (int i = 0; i < addrs.length; i++) ips[i] = addrs[i].getHostAddress();
            result.put("dnsResolved", true);
            result.put("ips", ips);

            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(host, port), 5000);
                result.put("tcpConnect", true);
            } catch (Exception e) {
                result.put("tcpConnect", false);
                result.put("tcpError", e.getMessage());
            }

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            result.put("dnsResolved", false);
            result.put("error", ex.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    // --- 辅助方法 ---

    /**
     * 提取获取用户逻辑，避免重复代码
     */
    private User getUser(UserDetails userDetails) {
        if (userDetails != null) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
        } else {
            // 未登录：查找或创建一个匿名用户
            String anonUsername = "anonymous";
            return userRepository.findByUsername(anonUsername).orElseGet(() -> {
                User u = new User();
                u.setUsername(anonUsername);
                u.setPassword(anonUsername + "-nopass");
                u.setRole("ANONYMOUS");
                return userRepository.save(u);
            });
        }
    }
}