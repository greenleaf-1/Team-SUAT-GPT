package suatgpt.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.Job;
import suatgpt.backend.repository.JobRepository;
import suatgpt.backend.repository.TenantConfigRepository;
import suatgpt.backend.service.InterviewService;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;
    private final JobRepository jobRepository;

    // 🚀 规范位置：统一在顶部注入配置仓库
    @Autowired
    private TenantConfigRepository tenantConfigRepository;

    public InterviewController(InterviewService interviewService, JobRepository jobRepository) {
        this.interviewService = interviewService;
        this.jobRepository = jobRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> handleUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobId") Long jobId,
            @RequestParam("candidateName") String candidateName,
            @RequestParam("email") String email,
            // 🚀 新增：物理接收前端传来的企业暗号
            @RequestParam(value = "tenantId", defaultValue = "recruit") String tenantId) {
        try {
            Job job = jobRepository.findById(jobId).orElseThrow();
            // 🚀 物理接力：把暗号传给 Service 进行专属解析
            return ResponseEntity.ok(interviewService.processResumeUpload(file, job, candidateName, email, tenantId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> interviewChat(@RequestBody Map<String, String> payload) {
        Long recordId = Long.valueOf(payload.get("recordId"));
        String userMsg = payload.get("message");
        int chatCount = Integer.parseInt(payload.getOrDefault("chatCount", "1"));

        // 🚀 新增：从 JSON 载荷中提取暗号
        String tenantId = payload.getOrDefault("tenantId", "recruit");

        // 🚀 物理接力：让 Service 内部通过暗号自动提取专属面试官人格
        String aiResponse = interviewService.processLiveChat(recordId, userMsg, chatCount, tenantId);
        return ResponseEntity.ok(Map.of("reply", aiResponse));
    }

    // =========================================================
    // 🚀 变色龙模式专属 API：向前端提供 UI 换皮数据
    // =========================================================
    @GetMapping("/config") // ⚠️ 核心修复：必须加上这个，前端才能访问到！
    public ResponseEntity<?> getTenantUiConfig(@RequestParam(defaultValue = "recruit") String tenantId) {
        try {
            suatgpt.backend.model.TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(null);

            // 提取企业名称/备注，如果没有配，默认叫“SUAT本部”
            String companyName = (config != null && config.getRemark() != null && !config.getRemark().isEmpty())
                    ? config.getRemark() : "SUAT本部";

            return ResponseEntity.ok(Map.of("tenantId", tenantId, "companyName", companyName));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("tenantId", tenantId, "companyName", "默认招聘"));
        }
    }
}