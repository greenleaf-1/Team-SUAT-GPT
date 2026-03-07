package suatgpt.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suatgpt.backend.model.Job;
import suatgpt.backend.model.InterviewRecord;
import suatgpt.backend.repository.JobRepository;
import suatgpt.backend.repository.InterviewRecordRepository;
import suatgpt.backend.service.InterviewService;
import suatgpt.backend.service.MailService;

import java.util.*;

@RestController
@RequestMapping("/api/recruit")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecruitController {

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

    // 🚀 1. 部长一键看大盘
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
            jobMap.put("candidateCount", candidates.size());
            jobMap.put("candidates", candidates); // 部长点击下拉，直接看到详细对话史
            stats.add(jobMap);
        }
        return ResponseEntity.ok(stats);
    }

    // 🚀 2. 部长录用决策并自动发信
    // 🚀 2. 部长录用决策并自动发信 (精准触达版)
    @PostMapping("/hire")
    public ResponseEntity<?> hire(@RequestBody Map<String, Long> payload) {
        try {
            // 1. 🔍 物理定位：拿到 recordId (它是连接一切的物理钥匙)
            Long id = payload.get("id");
            System.out.println("📬 [录取指令接入] 正在处理档案 ID: " + id);

            InterviewRecord record = interviewRecordRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("档案物理丢失，无法录用"));

            // 2. 💾 状态落库
            record.setStatus("HIRED");
            interviewRecordRepository.save(record);

            // 3. 📧 物理提取邮箱：优先使用候选人填写的邮箱
            // 💡 逻辑：如果 record.getEmail() 为空或只有空格，则使用叶总邮箱兜底
            String targetEmail = (record.getEmail() != null && !record.getEmail().trim().isEmpty())
                    ? record.getEmail()
                    : "SUAT24000137@stu.suat-sz.edu.cn";

            System.out.println("🛰️ [物理发信中] 目标地址: " + targetEmail + " | 候选人: " + record.getCandidateName());

            // 4. ⚡ 物理发射：调用邮件引擎
            String subject = "入职通知书 - " + record.getCandidateName();
            String content = String.format(
                    "尊敬的 %s：\n\n恭喜您通过面试！经审批，您已正式被录用为【%s】！\n请于7日内与我单位相关对接人联系，进一步确认具体的入职时间及报到地点。期待您的加入。\n\n\n\nAI面试官",
                    record.getCandidateName(),
                    record.getJobTitle()
            );

            mailService.sendHomework(targetEmail, subject, content);

            return ResponseEntity.ok(Map.of(
                    "code", 200,
                    "message", "录用指令已物理送达至：" + targetEmail,
                    "target", targetEmail
            ));
        } catch (Exception e) {
            // 🚀 物理通报：在控制台打印详细错误，防止盲目调试
            System.err.println("🔥 [邮件引擎熄火]: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "邮件发送物理故障: " + e.getMessage()));
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

    // 🚀 4. 部长增删岗位
    @PostMapping("/jobs/publish")
    public ResponseEntity<?> saveJob(@RequestBody Job job) {
        job.setStatus("OPEN");
        Job saved = jobRepository.save(job);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        // 防外键报错：先删候选人，再删岗位
        List<InterviewRecord> records = interviewRecordRepository.findByJobId(id);
        interviewRecordRepository.deleteAll(records);
        jobRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ==========================================
    // 🚀 物理雷达：供前端实时查询候选人档案状态
    // ==========================================
    @GetMapping("/candidate/{id}")
    public ResponseEntity<InterviewRecord> getCandidateDetail(@PathVariable Long id) {
        return interviewRecordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}