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

    // 在类顶部注入
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TenantConfigRepository tenantConfigRepository;
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // 1. 🚀 解决 404: 获取用户列表
    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 2. 🚀 解决 404: 获取所有分身系统配置
    @GetMapping("/tenant-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllConfigs() {
        return ResponseEntity.ok(tenantConfigRepository.findAll());
    }

    // 3. 🚀 物理保存/更新提示词
    @PostMapping("/tenant-configs/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveConfig(@RequestBody TenantConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        tenantConfigRepository.save(config);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // 🚀 1. 重置密码接口
    @PostMapping("/user/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String newPassword = payload.get("newPassword");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 物理重写密码（使用您 Service 里的加密器）
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "密码已重置"));
    }

    // 🚀 2. 强制注销/冻结接口
    @PostMapping("/user/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 物理切换：如果是 ACTIVE 就切到 TIMEOUT(冻结)，反之亦然
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

    // 🚀 1. 部长一键看大盘 (已修复字段丢失问题)
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
            // 🚀 物理补全：手动装配丢失的发布者 ID
            jobMap.put("publisherId", job.getPublisherId());
            jobMap.put("candidateCount", candidates.size());
            jobMap.put("candidates", candidates);
            stats.add(jobMap);
        }
        return ResponseEntity.ok(stats);
    }

    // 🚀 2. 部长录用决策并自动发信 (保持不变)
    @PostMapping("/hire")
    public ResponseEntity<?> hire(@RequestBody Map<String, Long> payload) {
        try {
            Long id = payload.get("id");
            InterviewRecord record = interviewRecordRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("档案物理丢失，无法录用"));
            record.setStatus("HIRED");
            interviewRecordRepository.save(record);

            String targetEmail = (record.getEmail() != null && !record.getEmail().trim().isEmpty())
                    ? record.getEmail()
                    : "SUAT24000137@stu.suat-sz.edu.cn";

            String subject = "入职通知书 - " + record.getCandidateName();
            String content = String.format(
                    "尊敬的 %s：\n\n恭喜您通过面试！经审批，您已正式被录用为【%s】！\n请于7日内与我单位相关对接人联系。 \n\nAI面试官",
                    record.getCandidateName(), record.getJobTitle()
            );
            mailService.sendHomework(targetEmail, subject, content);
            return ResponseEntity.ok(Map.of("code", 200, "message", "录用成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 🚀 3. 部长发招聘广告 (AI 辅助)
    @PostMapping("/generate-ad")
    public ResponseEntity<?> generateAd(@RequestBody Map<String, String> params) {
        String title = params.getOrDefault("title", "未命名岗位");
        String demand = params.getOrDefault("demand", "");
        String finalAd = interviewService.automatedWorkflow(title + ": " + demand);
        return ResponseEntity.ok(Map.of("success", true, "adContent", finalAd));
    }

    // 🚀 4. 部长发布岗位 (已修复 ID 绑定问题)
    @PostMapping("/jobs/publish")
    public ResponseEntity<?> saveJob(@RequestBody Job job, @AuthenticationPrincipal UserPrincipal currentUser) {
        job.setStatus("OPEN");
        // 🚀 物理绑定：保存时自动抓取当前登录人的 ID
        if (currentUser != null) {
            job.setPublisherId(currentUser.getId());
        }
        Job saved = jobRepository.save(job);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        // 🚀 物理降维：不再接收 @AuthenticationPrincipal，直接开干
        Job job = jobRepository.findById(id).orElse(null);
        if (job == null) {
            return ResponseEntity.status(404).body(Map.of("message", "岗位不存在"));
        }

        try {
            // 1. 关联清理：防外键报错
            List<InterviewRecord> records = interviewRecordRepository.findByJobId(id);
            if (records != null && !records.isEmpty()) {
                interviewRecordRepository.deleteAll(records);
            }

            // 2. 物理爆破
            jobRepository.deleteById(id);

            return ResponseEntity.ok(Map.of("success", true, "message", "岗位已彻底抹除"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "抹除失败: " + e.getMessage()));
        }
    }

    @GetMapping("/candidate/{id}")
    public ResponseEntity<InterviewRecord> getCandidateDetail(@PathVariable Long id) {
        return interviewRecordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}