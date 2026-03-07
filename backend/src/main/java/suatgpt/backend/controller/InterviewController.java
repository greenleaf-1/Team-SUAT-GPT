package suatgpt.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.Job;
import suatgpt.backend.repository.JobRepository;
import suatgpt.backend.service.InterviewService;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;
    private final JobRepository jobRepository;

    public InterviewController(InterviewService interviewService, JobRepository jobRepository) {
        this.interviewService = interviewService;
        this.jobRepository = jobRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> handleUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobId") Long jobId,
            @RequestParam("candidateName") String candidateName, // 🚀 接收前端传来的邮箱
            @RequestParam("email") String email) {
        try {
            Job job = jobRepository.findById(jobId).orElseThrow();
            return ResponseEntity.ok(interviewService.processResumeUpload(file, job, candidateName, email));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> interviewChat(@RequestBody Map<String, String> payload) {
        Long recordId = Long.valueOf(payload.get("recordId"));
        String userMsg = payload.get("message");
        int chatCount = Integer.parseInt(payload.getOrDefault("chatCount", "1"));

        // 🚀 物理移交：让 Service 内部通过 recordId 自动完成简历注入
        String aiResponse = interviewService.processLiveChat(recordId, userMsg, chatCount);
        return ResponseEntity.ok(Map.of("reply", aiResponse));
    }
}