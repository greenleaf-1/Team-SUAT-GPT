package suatgpt.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import suatgpt.backend.config.InterviewPromptRegistry;
import suatgpt.backend.model.User;
import suatgpt.backend.model.Job;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.repository.JobRepository;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recruit")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecruitController {

    // 🚀 迁移关键：使用配置变量，若未配置则默认为当前目录下 uploads 文件夹
    @Value("${app.upload.path:./uploads/interview/}")
    private String workspace;

    private static final Map<String, StringBuilder> sessionHistoryPool = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public RecruitController(UserRepository userRepository, JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    /**
     * 物理初始化：确保上传目录在任何系统（Win/Linux）下都存在
     */
    @PostConstruct
    public void init() {
        File dir = new File(workspace);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            System.out.println(">>> [系统初始化] 物理存储路径创建: " + workspace + " (" + created + ")");
        }
    }

    /**
     * 🚀 1. 全量监控 (admin.html 专用)
     */
    @GetMapping("/all-users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * 🚀 2. 招聘中枢数据 (recruit.html 专用)
     */
    @GetMapping("/candidates")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getRealCandidates() {
        return userRepository.findAll().stream()
                .filter(u -> "CANDIDATE".equals(u.getRole()))
                .filter(u -> !"GUEST".equals(u.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * 🚀 3. 核心面试对话 (接入数据库 Job 描述)
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> interviewChat(@RequestBody Map<String, Object> payload) {
        String userMsg = payload.getOrDefault("message", "").toString();
        String fileName = payload.getOrDefault("fileName", "unknown_candidate").toString();

        // 🚀 业务逻辑：根据前端传来的 jobId 从数据库实时拉取岗位要求
        String jobDescription = "通用岗位";
        if (payload.get("jobId") != null) {
            Optional<Job> job = jobRepository.findById(Long.parseLong(payload.get("jobId").toString()));
            if (job.isPresent()) {
                jobDescription = job.get().getDescription();
            }
        }

        int chatCount = Integer.parseInt(payload.getOrDefault("chatCount", "1").toString());
        String stageTask = InterviewPromptRegistry.getStageTask(chatCount);
        StringBuilder history = sessionHistoryPool.computeIfAbsent(fileName, k -> new StringBuilder("面试开始\n"));

        // 构造全量 Prompt
        String finalPrompt = String.format(
                InterviewPromptRegistry.INTERVIEW_TEMPLATE,
                fileName, jobDescription, chatCount, stageTask, history.toString(), userMsg
        );

        String aiResponse = callOpenClawCLI(finalPrompt);

        // 物理截断与防御
        if (aiResponse.contains("核心指令") || aiResponse.length() < 2) {
            aiResponse = InterviewPromptRegistry.FALLBACK_RESPONSE;
        }

        history.append("人:").append(userMsg).append(" | 机:").append(aiResponse).append("\n");

        Map<String, String> response = new HashMap<>();
        response.put("reply", aiResponse.trim());
        return ResponseEntity.ok(response);
    }

    /**
     * 4. 简历上传
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            File destFile = new File(workspace, file.getOriginalFilename());
            file.transferTo(destFile.getAbsoluteFile());

            sessionHistoryPool.remove(file.getOriginalFilename());
            response.put("code", 200);
            response.put("fileName", file.getOriginalFilename());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 5. 跨平台执行器：自适应操作系统命令
     */
    private String callOpenClawCLI(String message) {
        StringBuilder result = new StringBuilder();
        try {
            String safeMsg = message.replace("\"", "'").replace("\n", " ");

            // 🚀 迁移关键：自动判定 OS，服务器通常是 Linux
            String os = System.getProperty("os.name").toLowerCase();
            ProcessBuilder pb;
            if (os.contains("win")) {
                pb = new ProcessBuilder("cmd", "/c", "openclaw", "agent", "--agent", "main", "--message", safeMsg);
            } else {
                pb = new ProcessBuilder("openclaw", "agent", "--agent", "main", "--message", safeMsg);
            }

            pb.redirectErrorStream(true);
            Process process = pb.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.contains("OpenClaw") || line.contains("2026-")) continue;
                    String cleanLine = line.replaceAll("\\x1B\\[[0-9;]*[mK]", "").trim();
                    if (!cleanLine.isEmpty()) result.append(cleanLine).append(" ");
                }
            }
            process.waitFor();
        } catch (Exception e) {
            return InterviewPromptRegistry.ERROR_RESPONSE;
        }
        return result.toString().trim();
    }
}