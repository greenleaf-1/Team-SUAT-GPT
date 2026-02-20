package suatgpt.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.config.CoursePromptRegistry;

import java.io.File;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/course")
@CrossOrigin
public class CourseController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(60))
            .build();

    @Value("${ai.qwen-public.api-key:}")
    private String qwenApiKey;

    @Value("${ai.qwen-public.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String qwenBaseUrl;

    /**
     * 核心萃取处理：强制执行物理留痕与 JSON 提取
     */
    @PostMapping("/process")
    public ResponseEntity<?> processCourse(@RequestBody Map<String, Object> payload) {
        String topic = (String) payload.get("topic");
        Integer step = (Integer) payload.get("step");
        // 关键：确保 history 能够正确还原上下文，避免 AI 反问素材
        String previousHistory = payload.get("history") != null ? payload.get("history").toString() : "课题原始素材";

        String finalPrompt = switch (step) {
            case 1 -> String.format(CoursePromptRegistry.STEP1_LOCATING, topic, previousHistory);
            case 2 -> String.format(CoursePromptRegistry.STEP2_ANALYSIS, previousHistory, topic);
            case 3 -> String.format(CoursePromptRegistry.STEP3_STRUCTURE, previousHistory, topic);
            case 4 -> String.format(CoursePromptRegistry.STEP4_CASES, previousHistory, topic);
            case 5 -> String.format(CoursePromptRegistry.STEP5_BRANDING, "实战型", previousHistory);
            case 6 -> String.format(CoursePromptRegistry.STEP6_PPT, previousHistory);
            case 7 -> String.format(CoursePromptRegistry.STEP7_MANUAL, previousHistory);
            default -> "请继续萃取内容";
        };

        try {
            String requestBody = objectMapper.createObjectNode()
                    .put("model", "qwen-plus")
                    .set("messages", objectMapper.createArrayNode()
                            .add(objectMapper.createObjectNode().put("role", "system").put("content", "你是一个只输出 JSON 的萃取机器人。禁止输出任何开场白或解释。"))
                            .add(objectMapper.createObjectNode().put("role", "user").put("content", finalPrompt)))
                    .toString();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(qwenBaseUrl + "/chat/completions"))
                    .header("Authorization", "Bearer " + qwenApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            String rawAiContent = root.path("choices").path(0).path("message").path("content").asText("");

            // --- 核心修复：JSON 清洗逻辑，防止解析报错 ---
            String cleanJson = extractJson(rawAiContent);

            // 物理留痕：记录每一页的萃取成果 [cite: 2026-02-19]
            savePageLog(topic, step, cleanJson);

            return ResponseEntity.ok(objectMapper.readValue(cleanJson, new TypeReference<Map<String, Object>>(){}));

        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "AI 格式错误: " + e.getMessage());
            errorMap.put("analysis", "萃取响应异常，请重试。");
            return ResponseEntity.ok(errorMap);
        }
    }

    private String extractJson(String input) {
        Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(input);
        if (matcher.find()) {
            return matcher.group();
        }
        return input;
    }

    // 地址：CourseController.java
    private void savePageLog(String topic, int step, String content) {
        try {
            // 加固：显式指定 logs 存放于 Jar 包同级目录
            Path logDir = Paths.get(System.getProperty("user.dir"), "logs", "extractions");

            // 关键诊断：如果目录创建失败，这里会报错到前端
            if (!Files.exists(logDir)) {
                Files.createDirectories(logDir);
            }

            String safeTopic = topic.replaceAll("[\\\\/:*?\"<>|]", "_");
            Files.writeString(logDir.resolve(safeTopic + "_" + step + ".json"), content, StandardCharsets.UTF_8);
            System.out.println("✅ 物理留痕成功: " + safeTopic + "_" + step); // 在宝塔日志中可查
        } catch (Exception e) {
            // 农夫建议：打印具体报错，方便在宝塔的“日志”里审计
            e.printStackTrace();
        }
    }
    /**
     * 解决重复条目：提取唯一课题名供侧边栏渲染
     */
    @GetMapping("/list-files")
    public ResponseEntity<List<String>> listFiles() {
        Set<String> topics = new LinkedHashSet<>();
        try {
            Path logDir = Paths.get(System.getProperty("user.dir"), "logs", "extractions");
            if (Files.exists(logDir)) {
                Files.list(logDir).map(p -> p.getFileName().toString())
                        .filter(n -> n.endsWith(".json") && n.contains("_"))
                        .sorted(Comparator.reverseOrder())
                        .forEach(n -> topics.add(n.substring(0, n.lastIndexOf("_"))));
            }
        } catch (Exception ignored) {}
        return ResponseEntity.ok(new ArrayList<>(topics));
    }

    /**
     * 物理还原：一键加载该课题所有步骤的 JSON
     */
    @GetMapping("/load-full-project")
    public ResponseEntity<Map<String, Object>> loadProject(@RequestParam String topic) {
        Map<String, Object> history = new HashMap<>();
        try {
            Path logDir = Paths.get(System.getProperty("user.dir"), "logs", "extractions");
            for (int i = 1; i <= 7; i++) {
                Path p = logDir.resolve(topic + "_" + i + ".json");
                if (Files.exists(p)) {
                    history.put(String.valueOf(i), objectMapper.readValue(Files.readString(p), Object.class));
                }
            }
        } catch (Exception e) { return ResponseEntity.status(500).build(); }
        return ResponseEntity.ok(history);
    }
}