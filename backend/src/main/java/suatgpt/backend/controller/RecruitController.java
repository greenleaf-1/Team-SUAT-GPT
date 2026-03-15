package suatgpt.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import suatgpt.backend.config.UserPrincipal;
import suatgpt.backend.model.Job;
import suatgpt.backend.model.InterviewRecord;
import suatgpt.backend.model.TenantConfig;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.JobRepository;
import suatgpt.backend.repository.InterviewRecordRepository;
import suatgpt.backend.repository.TenantConfigRepository;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.service.InterviewService;
import suatgpt.backend.service.MailService;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/recruit")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecruitController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TenantConfigRepository tenantConfigRepository;
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/tenant-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllConfigs() {
        return ResponseEntity.ok(tenantConfigRepository.findAll());
    }

    @PostMapping("/tenant-configs/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveConfig(@RequestBody TenantConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        tenantConfigRepository.save(config);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/user/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String newPassword = payload.get("newPassword");
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "密码已重置"));
    }

    @PostMapping("/user/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("用户不存在"));
        String newStatus = "ACTIVE".equals(user.getStatus()) ? "TIMEOUT" : "ACTIVE";
        user.setStatus(newStatus);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "status", newStatus));
    }

    private final JobRepository jobRepository;
    private final InterviewRecordRepository interviewRecordRepository;
    private final InterviewService interviewService;
    private final MailService mailService;

    public RecruitController(JobRepository jobRepository,
                             InterviewRecordRepository interviewRecordRepository,
                             InterviewService interviewService,
                             MailService mailService) {
        this.jobRepository = jobRepository;
        this.interviewRecordRepository = interviewRecordRepository;
            this.interviewService = interviewService;
        this.mailService = mailService;
    }

    @GetMapping("/job-stats")
    public ResponseEntity<List<Map<String, Object>>> getJobStats() {
        List<Job> allJobs = jobRepository.findAll();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Job job : allJobs) {
            List<InterviewRecord> candidates = interviewRecordRepository.findByJobId(job.getId());
            Map<String, Object> jobMap = new HashMap<>();
            jobMap.put("id", job.getId());
            jobMap.put("title", job.getTitle());
            jobMap.put("adText", job.getAdText());
            jobMap.put("status", job.getStatus());
            jobMap.put("publisherId", job.getPublisherId());
            jobMap.put("candidateCount", candidates.size());
            jobMap.put("candidates", candidates);
            stats.add(jobMap);
        }
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/hire")
    public ResponseEntity<?> hire(@RequestBody Map<String, String> payload) {
        try {
            Long id = Long.valueOf(payload.get("id"));
            InterviewRecord record = interviewRecordRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("档案物理丢失，无法录用"));

            // 🚀 核心关键点：我们要确认前端有没有把 tenantId 传过来
            String tenantId = payload.getOrDefault("tenantId", "recruit");

            // 1. 尝试提取分身配置
            TenantConfig config = tenantConfigRepository.findByTenantId(tenantId)
                    .orElseThrow(() -> new RuntimeException("无法提取分身配置，请确保 Admin 后台已配置 /" + tenantId));

            // 2. 更新状态
            record.setStatus("HIRED");
            interviewRecordRepository.save(record);

            // 3. 物理发信（最容易炸的地方）
            String targetEmail = (record.getEmail() != null && !record.getEmail().trim().isEmpty())
                    ? record.getEmail() : "SUAT24000137@stu.suat-sz.edu.cn";

            try {
                // 🚀 这里就是您之前的发信代码
                mailService.sendDynamicOffer(targetEmail, record.getCandidateName(), record.getJobTitle(), config);
            } catch (Exception mailError) {
                // 照妖镜 1：如果邮件发失败了，打印红字，但不让整个接口崩溃
                System.err.println("❌ [物理发信失败] 检查 SMTP 配置或网络:");
                mailError.printStackTrace();
                return ResponseEntity.ok(Map.of("code", 200, "message", "录用状态已更新，但 Offer 邮件发送失败，请在控制台查看原因"));
            }

            return ResponseEntity.ok(Map.of("code", 200, "message", "录用成功，专属 Offer 邮件已发出"));
        } catch (Exception e) {
            // 照妖镜 2：如果是逻辑报错（比如 id 没传对），这里会抓到
            System.err.println("❌ [录用接口逻辑崩溃]:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 🚀 3. 部长发招聘广告 (AI 辅助)
    @PostMapping("/generate-ad")
    public ResponseEntity<?> generateAd(@RequestBody Map<String, String> params) {
        String title = params.getOrDefault("title", "未命名岗位");
        String demand = params.getOrDefault("demand", "");
        // 🚀 新增：物理提取机构暗号
        String tenantId = params.getOrDefault("tenantId", "recruit");

        // 🚀 传入暗号，提取专属润色文风
        String finalAd = interviewService.automatedWorkflow(title + ": " + demand, tenantId);
        return ResponseEntity.ok(Map.of("success", true, "adContent", finalAd));
    }

    @PostMapping("/jobs/publish")
    public ResponseEntity<?> saveJob(@RequestBody Job job, @AuthenticationPrincipal UserPrincipal currentUser) {
        job.setStatus("OPEN");
        if (currentUser != null) {
            job.setPublisherId(currentUser.getId());
        }
        Job saved = jobRepository.save(job);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id).orElse(null);
        if (job == null) return ResponseEntity.status(404).body(Map.of("message", "岗位不存在"));
        try {
            List<InterviewRecord> records = interviewRecordRepository.findByJobId(id);
            if (records != null && !records.isEmpty()) interviewRecordRepository.deleteAll(records);
            jobRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "岗位已彻底抹除"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "抹除失败: " + e.getMessage()));
        }
    }

    @GetMapping("/candidate/{id}")
    public ResponseEntity<InterviewRecord> getCandidateDetail(@PathVariable Long id) {
        return interviewRecordRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}