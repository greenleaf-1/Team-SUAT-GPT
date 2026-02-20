package suatgpt.backend.controller;

import org.apache.poi.extractor.ExtractorFactory;
import org.apache.poi.extractor.POITextExtractor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.service.LlmService;
import suatgpt.backend.config.CoursePromptRegistry;
import java.io.InputStream;
import java.util.*;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/course")
// ✅ 不要写死 localhost，使用 "*" 代表允许任何来源访问（生产环境建议换成你的域名）
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CourseEvalController {

    private static final Logger logger = Logger.getLogger(CourseEvalController.class.getName());
    private final LlmService llmService;
    private String uploadedContext = ""; // 存储 David 上传的原始文稿内容

    public CourseEvalController(LlmService llmService) {
        this.llmService = llmService;
    }

    /**
     * ✅ 兼容模式文件上传：支持 .doc 和 .docx
     */
    @PostMapping("/upload-experience")
    public Map<String, Object> handleUpload(@RequestParam("file") MultipartFile file) {
        try (InputStream is = file.getInputStream();
             POITextExtractor extractor = ExtractorFactory.createExtractor(is)) {
            this.uploadedContext = extractor.getText();
            logger.info("David，名师网智能兼容解析成功！字数：" + uploadedContext.length());
            return Map.of("status", "success", "contentLength", uploadedContext.length());
        } catch (Exception e) {
            logger.severe("文件解析异常：" + e.getMessage());
            return Map.of("status", "error", "error", "解析失败：请确保文件是标准的 Word 格式");
        }
    }

    /**
     * ✅ 链式萃取核心逻辑：环环相扣
     */
    @PostMapping("/process-eval")
    @SuppressWarnings("unchecked")
    public Map<String, Object> processStep(@RequestBody Map<String, Object> params) {
        try {
            int step = Integer.parseInt(params.getOrDefault("step", "1").toString());
            String topic = (String) params.get("topic");
            String style = (String) params.getOrDefault("selectedStyle", "实战型");

            // 提取上一步的产出作为上下文
            Map<String, Object> history = (Map<String, Object>) params.get("history");
            String prevOutput = (history != null) ? history.toString() : "无历史上下文";

            return switch (step) {
                case 1 -> generateResponse(CoursePromptRegistry.STEP1_LOCATING, uploadedContext, topic);
                case 2 -> generateResponse(CoursePromptRegistry.STEP2_ANALYSIS, prevOutput, topic);
                case 3 -> generateResponse(CoursePromptRegistry.STEP3_STRUCTURE, prevOutput, topic);
                case 4 -> generateResponse(CoursePromptRegistry.STEP4_CASES, prevOutput, topic);
                case 5 -> generateResponse(CoursePromptRegistry.STEP5_BRANDING, style, topic + " (基于内容: " + prevOutput + ")");
                case 6 -> generateResponse(CoursePromptRegistry.STEP6_PPT, prevOutput, topic);
                case 7 -> generateResponse(CoursePromptRegistry.STEP7_MANUAL, prevOutput, topic);
                default -> Map.of("error", "步骤越界");
            };
        } catch (Exception e) {
            return Map.of("error", "萃取引擎推演失败: " + e.getMessage());
        }
    }

    private Map<String, Object> generateResponse(String template, String context, String target) {
        String fullPrompt = String.format(template, context, target);
        return llmService.callAI(fullPrompt, target);
    }
}