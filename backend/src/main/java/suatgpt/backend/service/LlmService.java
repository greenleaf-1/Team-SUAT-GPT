package suatgpt.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import suatgpt.backend.config.AiProperties;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Service
public class LlmService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;
    private final AiProperties aiProperties;

    public LlmService(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        // ✅ 保持直连模式，移除代理干扰
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();

        System.out.println("🚀 [LlmService] AI 引擎直连就绪（已强化 JSON 提取逻辑）");
    }

    public Map<String, Object> callAI(String systemPrompt, String userPrompt) {
        String apiKey = aiProperties.getDeepseekPublic().getApiKey();
        String baseUrl = aiProperties.getDeepseekPublic().getBaseUrl();

        String fullUrl = baseUrl.contains("/chat/completions") ? baseUrl : baseUrl + "/chat/completions";
        if (baseUrl.endsWith("/v1")) {
            fullUrl = baseUrl + "/chat/completions";
        }

        try {
            String requestBody = """
                {
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "%s"},
                        {"role": "user", "content": "%s"}
                    ],
                    "response_format": {"type": "json_object"}, 
                    "temperature": 0.3
                }
                """.formatted(escapeJson(systemPrompt), escapeJson(userPrompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return Map.of("error", "API 异常: " + response.statusCode());
            }

            Map<String, Object> rawResponse = objectMapper.readValue(response.body(), Map.class);
            String content = extractContentFromResponse(rawResponse);

            // ✅ 强化防御：精准提取 JSON 块，防止 AI 携带 Markdown 标签或解释性文字
            content = cleanAndExtractJson(content);

            try {
                return objectMapper.readValue(content, Map.class);
            } catch (Exception e) {
                System.err.println("❌ JSON 解析失败，原始内容: " + content);
                // 兜底：返回一个空结构，防止前端渲染崩溃
                return Map.of(
                        "score", 0,
                        "metrics", Map.of("rarity",0,"utility",0,"freshness",0,"granularity",0),
                        "analysis", "AI 返回格式异常，请重试。",
                        "advice", "检查提示词约束"
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "后端运行异常: " + e.getMessage());
        }
    }

    /**
     * ✅ 核心算法：从杂乱文本中精准提取第一个完整的 JSON 对象
     */
    private String cleanAndExtractJson(String content) {
        if (content == null || content.isEmpty()) return "{}";

        // 1. 去除常见的 Markdown 标识符
        content = content.replace("```json", "").replace("```", "").trim();

        // 2. 寻找第一个 { 和最后一个 }
        int start = content.indexOf("{");
        int end = content.lastIndexOf("}");

        if (start != -1 && end != -1 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }

    private String extractContentFromResponse(Map<String, Object> raw) {
        try {
            var choices = (java.util.List<?>) raw.get("choices");
            var firstChoice = (Map<?, ?>) choices.get(0);
            var message = (Map<?, ?>) firstChoice.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "{}";
        }
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}