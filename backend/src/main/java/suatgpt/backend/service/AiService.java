package suatgpt.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
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
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class AiService implements InitializingBean {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final RestTemplate restTemplate;

    // 【修正点 1】@Autowired 必须放在类级别，且建议使用构造函数或 Setter 注入
    @Autowired
    private MailService mailService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.anything-llm.base-url:}") private String anythingLlmBaseUrl;
    @Value("${ai.anything-llm.api-key:}") private String anythingLlmApiKey;
    @Value("${ai.anything-llm.workspace-slug:}") private String workspaceSlug;

    @Value("${ai.qwen-public.base-url:}") private String qwenPubBaseUrl;
    @Value("${ai.qwen-public.api-key:}") private String qwenPubApiKey;

    @Value("${ai.deepseek.base-url:}") private String dsCustomBaseUrl;
    @Value("${ai.deepseek.api-key:}") private String dsCustomApiKey;
    @Value("${ai.deepseek.weknora-session-id:}") private String weknoraSessionId;
    @Value("${ai.deepseek.weknora-kb-id:}") private String weknoraKbId;

    public AiService(ChatMessageRepository chatMessageRepository,
                     ChatSessionRepository chatSessionRepository,
                     RestTemplate restTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.restTemplate = restTemplate;
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

        // 1. 【Agent 任务拦截：交作业逻辑】
        if (userMessage.contains("发作业") || userMessage.contains("提交作业")) {
            handleHomeworkTask(session, userMessage, emitter);
            return; // 拦截后续普通 AI 聊天逻辑
        }

        // 2. 正常聊天持久化逻辑
        chatMessageRepository.save(new ChatMessage(session, "USER", userMessage));

        String requestUri = "";
        String jsonRequest = "";
        String apiKey = "";

        var requestBuilder = HttpRequest.newBuilder()
                .header("Content-Type", "application/json");

        if ("deepseek".equals(modelKey)) {
            apiKey = dsCustomApiKey;
            requestUri = dsCustomBaseUrl + "/knowledge-chat/" + weknoraSessionId;
            jsonRequest = String.format(
                    "{\"query\":\"%s\", \"knowledge_base_ids\":[\"%s\"]}",
                    escapeJson(userMessage), weknoraKbId
            );
            requestBuilder.header("X-API-Key", apiKey);
        } else {
            String baseUrl, modelId;
            if ("anything-llm".equals(modelKey)) {
                baseUrl = anythingLlmBaseUrl;
                apiKey = anythingLlmApiKey;
                modelId = workspaceSlug;
            } else {
                baseUrl = qwenPubBaseUrl;
                apiKey = qwenPubApiKey;
                modelId = "qwen-plus";
            }
            requestUri = baseUrl + "/chat/completions";
            jsonRequest = String.format(
                    "{\"model\":\"%s\",\"messages\":[{\"role\":\"user\",\"content\":\"%s\"}],\"stream\":true}",
                    modelId, escapeJson(userMessage));
            requestBuilder.header("Authorization", "Bearer " + apiKey);
        }

        System.out.println(">>> EXECUTE URL: " + requestUri);

        if (requestUri == null || requestUri.isBlank()) {
            throw new RuntimeException("Error: Request URI is null!");
        }

        HttpRequest request = requestBuilder
                .uri(URI.create(requestUri))
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
                        System.out.println("DEBUG RAW: " + line);

                        if (line.startsWith("data:")) {
                            String dataStr = line.substring(5).trim();
                            if (dataStr.isEmpty() || "[DONE]".equals(dataStr)) continue;

                            try {
                                JsonNode node = objectMapper.readTree(dataStr);
                                String chunk = "";

                                if (node.has("choices")) {
                                    chunk = node.path("choices").get(0).path("delta").path("content").asText("");
                                } else if ("answer".equals(node.path("response_type").asText())) {
                                    chunk = node.path("content").asText("");
                                }

                                if (!chunk.isEmpty()) {
                                    emitter.send(chunk);
                                    fullResponse.append(chunk);
                                }

                                if ("complete".equals(node.path("response_type").asText())) {
                                    break;
                                }

                            } catch (Exception e) {
                                if (!dataStr.startsWith("{")) {
                                    emitter.send(dataStr);
                                    fullResponse.append(dataStr);
                                }
                            }
                        }
                    }
                }
                chatMessageRepository.save(new ChatMessage(session, "AI", fullResponse.toString()));
                emitter.complete();
            } catch (Exception e) {
                System.err.println("Critical Error: " + e.getMessage());
                emitter.completeWithError(e);
            }
        });
    }

    /**
     * 【新增：交作业任务处理私有方法】
     */
    private void handleHomeworkTask(ChatSession session, String userMessage, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                emitter.send("[Agent 正在分析指令...]\n");
                emitter.send("[正在调取叶总联系方式...]\n");

                // 记录用户消息到数据库
                chatMessageRepository.save(new ChatMessage(session, "USER", userMessage));

                // 实际开发中可改为去 WeKnora 搜索，此处先演示王老师邮箱逻辑
                String teacherEmail = "SUAT24000191@stu.suat-sz.edu.cn";
                String teacherName = "叶总";

                emitter.send("[正在通过教育邮箱发送作业给 " + teacherName + "...]\n");

                mailService.sendHomework(teacherEmail, "24级计科班作业提交 - 李智诚",
                        "老师您好，这是我的最新课程作业，请查收。\n-- 本邮件由 SUAT-GPT Agent 自动发送");

                String completionMsg = "✅ [任务完成]：作业已成功发送至 " + teacherName + " 的邮箱 (" + teacherEmail + ")。";
                emitter.send(completionMsg);

                // 记录 Agent 的回复到数据库
                chatMessageRepository.save(new ChatMessage(session, "AI", completionMsg));
                emitter.complete();

            } catch (Exception e) {
                try {
                    emitter.send("❌ [任务失败]：邮件服务连接超时或配置错误。");
                } catch (Exception ignored) {}
                emitter.completeWithError(e);
            }
        });
    }

    public boolean uploadAndEmbed(MultipartFile file) {
        try {
            String nativeBase = anythingLlmBaseUrl.replace("/openai", "");
            String uploadUrl = nativeBase + "/document/upload";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", "Bearer " + anythingLlmApiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> uploadResponse = restTemplate.postForEntity(uploadUrl, requestEntity, Map.class);

            if (uploadResponse.getBody() != null) {
                String docPath = (String) ((Map)((java.util.List)uploadResponse.getBody().get("documents")).get(0)).get("location");
                String updateUrl = String.format("%s/workspace/%s/update-embeddings", nativeBase, workspaceSlug);
                Map<String, Object> updateBody = new HashMap<>();
                updateBody.put("adds", new String[]{docPath});
                restTemplate.postForEntity(updateUrl, new HttpEntity<>(updateBody, headers), Map.class);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}