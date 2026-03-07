//package suatgpt.backend.controller;
//
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.apache.poi.extractor.ExtractorFactory;
//import org.apache.poi.extractor.POITextExtractor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//import suatgpt.backend.config.CoursePromptRegistry;
//import suatgpt.backend.service.LlmService;
//
//import java.io.InputStream;
//import java.util.*;
//
//@RestController
//@RequestMapping("/api/course")
//@CrossOrigin(origins = "*") // 🚀 物理放行，解决跨域
//public class UnifiedCourseController {
//
//    private final LlmService llmService;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    public UnifiedCourseController(LlmService llmService) {
//        this.llmService = llmService;
//    }
//
//    /**
//     * 🚀 物理对齐：一个接口处理所有萃取请求
//     */
//    @PostMapping("/process")
//    public ResponseEntity<?> handleProcess(@RequestBody Map<String, Object> payload) {
//        try {
//            String topic = (String) payload.get("topic");
//            int step = Integer.parseInt(payload.getOrDefault("step", "1").toString());
//            String style = (String) payload.getOrDefault("selectedStyle", "实战型");
//
//            // 💡 重点：这里接收前端传来的长文本
//            String userContent = (String) payload.get("content");
//            String history = payload.get("history") != null ? payload.get("history").toString() : "";
//
//            // 根据步骤选择提示词
//            String promptTemplate = switch (step) {
//                case 1 -> CoursePromptRegistry.STEP1_LOCATING;
//                case 2 -> CoursePromptRegistry.STEP2_ANALYSIS;
//                case 3 -> CoursePromptRegistry.STEP3_STRUCTURE;
//                case 4 -> CoursePromptRegistry.STEP4_CASES;
//                case 5 -> CoursePromptRegistry.STEP5_BRANDING;
//                case 6 -> CoursePromptRegistry.STEP6_PPT;
//                case 7 -> CoursePromptRegistry.STEP7_MANUAL;
//                default -> throw new IllegalArgumentException("非法步骤");
//            };
//
//            // 物理降维打击：直接调用 LLM
//            String fullPrompt = String.format(promptTemplate, topic, history);
//            Map<String, Object> aiResult = llmService.callAI(fullPrompt, userContent, "aliyun-coding");
//
//            return ResponseEntity.ok(aiResult);
//        } catch (Exception e) {
//            return ResponseEntity.ok(Map.of("error", "物理链路异常: " + e.getMessage()));
//        }
//    }
//
//    /**
//     * 🚀 仅保留一个文件上传入口，作为备用
//     */
//    @PostMapping("/upload-experience")
//    public Map<String, Object> handleUpload(@RequestParam("file") MultipartFile file) {
//        try (InputStream is = file.getInputStream();
//             POITextExtractor extractor = ExtractorFactory.createExtractor(is)) {
//            String content = extractor.getText();
//            return Map.of("status", "success", "content", content); // 把内容返回给前端，填入输入框
//        } catch (Exception e) {
//            return Map.of("status", "error", "message", "Word解析失败");
//        }
//    }
//}