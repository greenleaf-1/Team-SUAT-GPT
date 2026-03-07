package suatgpt.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.service.HomeworkService;
import suatgpt.backend.repository.HomeworkRecordRepository;
import suatgpt.backend.repository.MentorMappingRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/homework")
public class HomeworkController {

    private final HomeworkService homeworkService;
    private final HomeworkRecordRepository repo;
    private final MentorMappingRepository mentorRepo; // 🚀 物理补丁：必须定义此变量

    public HomeworkController(HomeworkService homeworkService,
                              HomeworkRecordRepository repo,
                              MentorMappingRepository mentorRepo) {
        this.homeworkService = homeworkService;
        this.repo = repo;
        this.mentorRepo = mentorRepo; // 🚀 物理补丁：完成赋值
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam("studentName") String studentName,
                                    @RequestParam("weekNumber") Integer weekNumber) {
        try {
            return ResponseEntity.ok(homeworkService.processReportUpload(file, studentName, weekNumber));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> payload) {
        Long recordId = Long.valueOf(payload.get("recordId").toString());
        String message = payload.get("message").toString();
        int chatCount = (int) payload.get("chatCount");
        String reply = homeworkService.processLiveChat(recordId, message, chatCount);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    @GetMapping("/mentor-stats")
    public ResponseEntity<?> getStats() {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("👁️ [雷达扫描] 导师身份: " + currentUser);

        if (currentUser.equals("王松") || currentUser.equals("admin")) {
            return ResponseEntity.ok(repo.findAllByOrderByWeekNumberDesc());
        } else {
            // 🚀 这里就是建立联系的关键：通过导师姓名过滤他名下的学生周报
            return ResponseEntity.ok(repo.findByMentorNameOrderByWeekNumberDesc(currentUser));
        }
    }

    @GetMapping("/student-info")
    public ResponseEntity<?> getStudentInfo(@RequestParam String studentId) {
        // 🚀 物理透视：打印收到的学号，检查是否有空格
        System.out.println("🔍 [身份查询信号]: " + studentId);

        return mentorRepo.findByStudentId(studentId.trim()) // 增加 .trim() 防止不可见字符
                .map(info -> ResponseEntity.ok(info)) // 移除之前不必要的 (Object) 强转
                .orElse(ResponseEntity.notFound().build());
    }
}