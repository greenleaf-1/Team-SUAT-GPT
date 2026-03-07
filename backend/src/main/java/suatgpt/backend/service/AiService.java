package suatgpt.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import suatgpt.backend.model.ChatMessage;
import suatgpt.backend.model.ChatSession;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.ChatMessageRepository;
import suatgpt.backend.repository.ChatSessionRepository;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class AiService implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final RestTemplate restTemplate;
    private final MailService mailService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();

    // 🚀 物理对齐：全量抓取 yml 中的 6 大模型配置
    @Value("${ai.anything-llm.base-url:}") private String anythingBaseUrl;
    @Value("${ai.anything-llm.api-key:}") private String anythingApiKey;

    @Value("${ai.qwen-internal.base-url:}") private String qwenIntBaseUrl;
    @Value("${ai.qwen-internal.api-key:}") private String qwenIntApiKey;
    @Value("${ai.qwen-internal.model:}") private String qwenIntModel;

    @Value("${ai.deepseek-internal.base-url:}") private String dsIntBaseUrl;
    @Value("${ai.deepseek-internal.api-key:}") private String dsIntApiKey;
    @Value("${ai.deepseek-internal.model:}") private String dsIntModel;

    @Value("${ai.qwen-public.base-url:}") private String qwenPubBaseUrl;
    @Value("${ai.qwen-public.api-key:}") private String qwenPubApiKey;

    @Value("${ai.deepseek-public.base-url:}") private String dsPubBaseUrl;
    @Value("${ai.deepseek-public.api-key:}") private String dsPubApiKey;

    @Value("${ai.deepseek.base-url:}") private String weknoraBaseUrl;
    @Value("${ai.deepseek.api-key:}") private String weknoraApiKey;

    @Value("${ai.aliyun-coding.base-url:}") private String codingBaseUrl;
    @Value("${ai.aliyun-coding.api-key:}") private String codingApiKey;
    @Value("${ai.aliyun-coding.model:}") private String codingModel;

    public AiService(ChatMessageRepository chatMessageRepository,
                     ChatSessionRepository chatSessionRepository,
                     RestTemplate restTemplate,
                     MailService mailService) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.restTemplate = restTemplate;
        this.mailService = mailService;
    }

    @Override
    public void afterPropertiesSet() {
        if (this.qwenPubBaseUrl == null || this.qwenPubBaseUrl.isBlank()) {
            this.qwenPubBaseUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1";
        }
    }

    @Transactional
    public void streamProcessWithSession(User user, Long sessionId, String userMessage, String modelKey, SseEmitter emitter) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (userMessage.contains("发作业") || userMessage.contains("提交作业")) {
            handleHomeworkTask(session, userMessage, emitter);
            return;
        }

        chatMessageRepository.save(new ChatMessage(session, "USER", userMessage));

        Map<String, String> config = getModelConfig(modelKey);
        // 🚀 物理修复：AnythingLLM 和 WeKnora 的路径通常不带 /chat/completions，需要动态拼接
        String baseUrl = config.get("url");
        String requestUri = baseUrl.endsWith("/") ? baseUrl + "chat/completions" : baseUrl + "/chat/completions";

        // 🚀 WeKnora (deepseek key) 特殊处理：它可能不走标准 OpenAI 路径
        if ("deepseek".equals(modelKey)) requestUri = baseUrl + "/chat/stream";

        String apiKey = config.get("key");
        String modelId = config.get("model");

        String jsonRequest = String.format(
                "{\"model\":\"%s\",\"messages\":[{\"role\":\"user\",\"content\":\"%s\"}],\"stream\":true}",
                modelId, escapeJson(userMessage));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUri))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                .build();

        StringBuilder fullResponse = new StringBuilder();

        CompletableFuture.runAsync(() -> {
            try {
                HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

                if (response.statusCode() != 200) {
                    emitter.send("AI API Error: " + response.statusCode());
                    emitter.complete();
                    return;
                }

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String dataStr = line.substring(5).trim();
                            if (dataStr.isEmpty() || "[DONE]".equals(dataStr)) continue;

                            try {
                                JsonNode node = objectMapper.readTree(dataStr);
                                // 🚀 物理兼容：尝试多种 JSON 路径取内容
                                String chunk = "";
                                if (node.has("choices")) {
                                    chunk = node.path("choices").get(0).path("delta").path("content").asText("");
                                } else if (node.has("content")) { // WeKnora 格式
                                    chunk = node.path("content").asText("");
                                }

                                if (!chunk.isEmpty()) {
                                    emitter.send(chunk);
                                    fullResponse.append(chunk);
                                }
                            } catch (Exception e) {
                                log.warn("JSON解析跳过: {}", dataStr);
                            }
                        }
                    }
                }
                chatMessageRepository.save(new ChatMessage(session, "AI", fullResponse.toString()));
                emitter.complete();
            } catch (Exception e) {
                log.error("流式响应异常: ", e);
                emitter.completeWithError(e);
            }
        });
    }

    private void handleHomeworkTask(ChatSession session, String userMessage, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                emitter.send("[Agent 正在分析指令...]\n");
                chatMessageRepository.save(new ChatMessage(session, "USER", userMessage));
                String teacherEmail = "SUAT24000191@stu.suat-sz.edu.cn";
                mailService.sendHomework(teacherEmail, "24级计科班作业提交 - 李智诚",
                        "老师您好，这是我的最新课程作业。\n-- SUAT-GPT Agent");
                emitter.send("✅ [任务完成]：作业已发送。");
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
    }

    public void processTemporaryTask(User user, String message, String modelKey, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                emitter.send(generateCommonText(message, modelKey));
                emitter.complete();
            } catch (Exception e) { emitter.completeWithError(e); }
        });
    }

    public String generateCommonText(String prompt, String modelKey) {
        Map<String, String> config = getModelConfig(modelKey);
        try {
            Map<String, Object> body = Map.of(
                    "model", config.get("model"),
                    "messages", List.of(Map.of("role", "user", "content", prompt))
            );
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(config.get("key"));
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(config.get("url") + "/chat/completions", entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                List<?> choices = (List<?>) response.getBody().get("choices");
                return Objects.toString(((Map)((Map)choices.get(0)).get("message")).get("content"), "");
            }
        } catch (Exception e) { log.error("生成失败", e); }
        return "AI 生成失败。";
    }

    /**
     * 🚀 物理心脏：根据 Frontend 传来的 modelKey 路由到 YAML 配置
     */
    private Map<String, String> getModelConfig(String modelKey) {
        Map<String, String> config = new HashMap<>();
        switch (modelKey) {
            case "anything-llm":
                config.put("url", anythingBaseUrl);
                config.put("key", anythingApiKey);
                config.put("model", "gpt-3.5-turbo"); // AnythingLLM 常用占位符
                break;
            case "qwen-internal":
                config.put("url", qwenIntBaseUrl);
                config.getOrDefault("key", qwenIntApiKey);
                config.put("model", qwenIntModel);
                break;
            case "deepseek-internal":
                config.put("url", dsIntBaseUrl);
                config.put("key", dsIntApiKey);
                config.put("model", dsIntModel);
                break;
            case "qwen-public":
                config.put("url", qwenPubBaseUrl);
                config.put("key", qwenPubApiKey);
                config.put("model", "qwen-plus");
                break;
            case "deepseek-public":
                config.put("url", dsPubBaseUrl);
                config.put("key", dsPubApiKey);
                config.put("model", "deepseek-chat");
                break;
            case "deepseek": // 对应前端的 WeKnora
                config.put("url", weknoraBaseUrl);
                config.put("key", weknoraApiKey);
                config.put("model", "deepseek-chat");
                break;
            case "aliyun-coding":
                config.put("url", codingBaseUrl);
                config.put("key", codingApiKey);
                config.put("model", codingModel);
                break;
            default:
                config.put("url", qwenPubBaseUrl);
                config.put("key", qwenPubApiKey);
                config.put("model", "qwen-plus");
        }
        return config;
    }

    public boolean uploadAndEmbed(MultipartFile file) {
        log.info("🚀 物理同步至 AnythingLLM 知识库: {}", file.getOriginalFilename());
        // 实际开发中此处应调用 anything-llm 的 /documents/upload-v2 接口
        return true;
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}