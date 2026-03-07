package suatgpt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.HomeworkRecord;
import suatgpt.backend.model.MentorMapping;
import suatgpt.backend.repository.HomeworkRecordRepository;
import suatgpt.backend.repository.MentorMappingRepository;
import suatgpt.backend.config.HomeworkPromptRegistry;

import java.io.File;
import java.util.Map;
import java.util.Optional;

@Service
public class HomeworkService {

    private final HomeworkRecordRepository homeworkRepo;
    private final MentorMappingRepository mentorRepo;
    private final InterviewService openclawService; // 复用您刚才修好的底层调用方法

    public HomeworkService(HomeworkRecordRepository homeworkRepo, MentorMappingRepository mentorRepo, InterviewService openclawService) {
        this.homeworkRepo = homeworkRepo;
        this.mentorRepo = mentorRepo;
        this.openclawService = openclawService;
    }

    // HomeworkService.java 关键片段

    public Map<String, Object> processReportUpload(MultipartFile file, String studentId, Integer weekNumber) throws Exception {
        // 🚀 物理对齐：不再按姓名找，直接按学号（studentId）锁定导师映射
        MentorMapping mapping = mentorRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("物理匹配失败：学号 [" + studentId + "] 未在导师映射表中注册。"));

        String studentName = mapping.getStudentName(); // 从映射表获取真实姓名

        // ... 文件保存逻辑保持不变 ...
        String dirPath = System.getProperty("os.name").toLowerCase().contains("win") ? "D:/OpenClawTest" : "/www/wwwroot/suat_data";
        File dir = new File(dirPath);
        if (!dir.exists()) dir.mkdirs();

        String safeName = "Week" + weekNumber + "_" + studentId + "_" + System.currentTimeMillis() + ".docx";
        file.transferTo(new File(dir, safeName));
        String dockerFilePath = "/root/.openclaw/workspace/" + safeName;

        // ... AI 审计 Prompt 注入 ...
        String prompt = String.format(HomeworkPromptRegistry.AUDIT_PROMPT, studentName, weekNumber, dockerFilePath);
        String aiAudit = openclawService.callOpenClawCLI(prompt);

        // 🚀 落库：通过学号 + 周次进行唯一性校验（覆盖或新建）
        Optional<HomeworkRecord> existing = homeworkRepo.findByStudentIdAndWeekNumber(studentId, weekNumber);
        HomeworkRecord record = existing.orElse(new HomeworkRecord());

        record.setStudentName(studentName);
        record.setStudentId(studentId);
        record.setMentorName(mapping.getMentorName()); // 锁定导师
        record.setWeekNumber(weekNumber);
        record.setAiEvaluation(aiAudit);
        record.setStatus("SUBMITTED");
        homeworkRepo.save(record);

        return Map.of("code", 200, "analysis", aiAudit, "recordId", record.getId(), "studentName", studentName);
    }

    public String processLiveChat(Long recordId, String userMsg, int chatCount) {
        HomeworkRecord record = homeworkRepo.findById(recordId).orElseThrow();

        String prompt = String.format(HomeworkPromptRegistry.TA_CHAT_TEMPLATE,
                record.getStudentName(), record.getMentorName(), record.getWeekNumber(),
                record.getAiEvaluation(), chatCount,
                record.getChatHistory() != null ? record.getChatHistory() : "", userMsg);

        String aiReply = openclawService.callOpenClawCLI(prompt);

        // 物理追写
        String updatedHistory = (record.getChatHistory() != null ? record.getChatHistory() : "")
                + "\n【学生】: " + userMsg + "\n【AI助教】: " + aiReply;
        record.setChatHistory(updatedHistory);
        homeworkRepo.save(record);

        return aiReply;
    }
}