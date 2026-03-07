package suatgpt.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import suatgpt.backend.config.AiProperties;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class LlmService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;
    private final AiProperties aiProperties;

    public LlmService(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(60)) // 招聘推演较慢，增加超时
                .build();
    }

    /**
     * 🚀 八路模型物理路由矩阵
     */
    private Map<String, String> routeModel(String modelKey) {
        Map<String, String> config = new HashMap<>();
        // 默认保底使用公网千问（因为目前它最稳）
        String url = aiProperties.getQwenPublic().getBaseUrl();
        String key = aiProperties.getQwenPublic().getApiKey();
        String model = "qwen-plus";

        switch (modelKey) {
            case "anything-llm" -> {
                url = aiProperties.getAnythingLlm().getBaseUrl();
                key = aiProperties.getAnythingLlm().getApiKey();
                model = "suat";
            }
            case "qwen-internal" -> {
                url = aiProperties.getQwenInternal().getBaseUrl();
                key = aiProperties.getQwenInternal().getApiKey();
                model = aiProperties.getQwenInternal().getModel();
            }
            case "deepseek-internal" -> {
                url = aiProperties.getDeepseekInternal().getBaseUrl();
                key = aiProperties.getDeepseekInternal().getApiKey();
                model = aiProperties.getDeepseekInternal().getModel();
            }
            case "qwen-public" -> {
                url = aiProperties.getQwenPublic().getBaseUrl();
                key = aiProperties.getQwenPublic().getApiKey();
                model = "qwen-plus";
            }
            case "deepseek-public" -> {
                url = aiProperties.getDeepseekPublic().getBaseUrl();
                key = aiProperties.getDeepseekPublic().getApiKey();
                model = "deepseek-chat";
            }
            case "weknora" -> { // 对应配置中的第7项 deepseek (WeKnora模式)
                url = aiProperties.getDeepseek().getBaseUrl();
                key = aiProperties.getDeepseek().getApiKey();
                model = "WeKnora";
            }
            case "aliyun-coding" -> {
                url = aiProperties.getAliyunCoding().getBaseUrl();
                key = aiProperties.getAliyunCoding().getApiKey();
                model = aiProperties.getAliyunCoding().getModel();
            }
            case "embedding" -> {
                url = aiProperties.getEmbedding().getBaseUrl();
                key = aiProperties.getEmbedding().getApiKey();
                model = aiProperties.getEmbedding().getModel();
            }
        }

        config.put("url", url.endsWith("/chat/completions") ? url : url + "/chat/completions");
        config.put("key", key);
        config.put("model", model);
        return config;
    }

    /**
     * 🛠️ 专门为招聘/制课设计的【同步返回文本】接口
     */
    public Map<String, Object> callAI(String systemPrompt, String userPrompt, String modelKey) {
        // 1. 物理路由获取配置
        Map<String, String> config = routeModel(modelKey);

        try {
            // 2. 物理构建 Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", config.get("model"));
            payload.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));
            payload.put("temperature", 0.7);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(config.get("url")))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + config.get("key"))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // 3. 物理错误诊断
            if (response.statusCode() != 200) {
                return Map.of("answer", "❌ 物理链路故障: " + response.statusCode() + " (检查模型 " + modelKey + " 是否欠费)");
            }

            // 4. 物理提取结果
            Map<String, Object> raw = objectMapper.readValue(response.body(), Map.class);
            var choices = (List<?>) raw.get("choices");
            var firstChoice = (Map<?, ?>) choices.get(0);
            var message = (Map<?, ?>) firstChoice.get("message");
            String content = (String) message.get("content");

            // 5. 统一包装返回，前端只需取 "answer"
            return Map.of("answer", content);

        } catch (Exception e) {
            return Map.of("answer", "❌ 后端运行异常: " + e.getMessage());
        }
    }
}