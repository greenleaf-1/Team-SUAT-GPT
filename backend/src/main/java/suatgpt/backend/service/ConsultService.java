package suatgpt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.ConsultConfig;
import suatgpt.backend.model.ConsultRecord;
import suatgpt.backend.repository.ConsultConfigRepository;
import suatgpt.backend.repository.ConsultRecordRepository;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
// 🚀 修复点1：清理了无用的导入，确保 Import 路径绝对正确
import java.util.Map;

@Service
public class ConsultService {

    // 🚀 修复点2：消除 Field injection 警告，改用 Spring 推荐的构造器强注入
    private final ConsultRecordRepository consultRecordRepository;
    private final ConsultConfigRepository consultConfigRepository;

    public ConsultService(ConsultRecordRepository consultRecordRepository, ConsultConfigRepository consultConfigRepository) {
        this.consultRecordRepository = consultRecordRepository;
        this.consultConfigRepository = consultConfigRepository;
    }

    private final String WORKSPACE_HOST = System.getProperty("os.name").toLowerCase().contains("win")
            ? "D:/OpenClawTest" : "/www/wwwroot/suat_data";
    private final String WORKSPACE_DOCKER = "/root/.openclaw/workspace";

    // ==========================================
    // 1. 破冰阶段：接收简历，抛出第1问
    // ==========================================
    public Map<String, Object> startConsultation(MultipartFile file, String userName, String email, String tenantId) throws Exception {
        File dir = new File(WORKSPACE_HOST);
        // 🚀 修复点3：处理 mkdirs() 警告
        if (!dir.exists() && !dir.mkdirs()) {
            System.err.println("⚠️ 警告：物理目录创建失败，可能会影响后续写盘！");
        }

        // 🚀 修复点4：彻底消除 NullPointerException 隐患
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            originalName = "resume_unknown.docx";
        }
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : ".docx";
        String safeName = System.currentTimeMillis() + extension;

        File destFile = new File(dir, safeName);
        file.transferTo(destFile);

        String aiReadablePath = System.getProperty("os.name").toLowerCase().contains("win")
                ? (WORKSPACE_HOST + "/" + safeName) : (WORKSPACE_DOCKER + "/" + safeName);

        ConsultConfig config = consultConfigRepository.findByTenantId(tenantId).orElse(null);
        String promptTemplate = (config != null && config.getPromptGreeting() != null) ? config.getPromptGreeting()
                : "请阅读简历 '%s'。向候选人打招呼，并提出第1个深度职业探索问题。";

        String fullPrompt = String.format(promptTemplate, aiReadablePath);
        String aiReply = callOpenClawCLI(fullPrompt);

        ConsultRecord record = new ConsultRecord();
        record.setUserName(userName);
        record.setContactEmail(email);
        record.setResumeText("【简历路径】: " + aiReadablePath);
        record.setChatHistory("【AI咨询师】: " + aiReply);
        record.setChatCount(0);
        record = consultRecordRepository.save(record);

        return Map.of("code", 200, "recordId", record.getId(), "reply", aiReply);
    }

    // ==========================================
    // 2. 漏斗循环：第2-5问 & 最终报告出具
    // ==========================================
    public Map<String, Object> processChat(Long recordId, String userMsg, String tenantId) {
        ConsultRecord record = consultRecordRepository.findById(recordId).orElseThrow(() -> new RuntimeException("档案丢失"));
        if ("FINISHED".equals(record.getStatus())) {
            return Map.of("reply", "本次咨询已结束，请查看最终报告。");
        }

        ConsultConfig config = consultConfigRepository.findByTenantId(tenantId).orElse(null);
        String currentHistory = record.getChatHistory() + "\n【咨询者】: " + userMsg;
        int currentCount = record.getChatCount() + 1;

        String fullPrompt;
        String aiReply;
        boolean isFinished = false;

        if (currentCount < 5) {
            String promptTemplate = (config != null && config.getPromptInterview() != null) ? config.getPromptInterview()
                    : "历史记录：%s\n用户说：%s\n请根据用户回答，继续提出第 %d 个问题（共5个）。严格只提问。";
            fullPrompt = String.format(promptTemplate, currentHistory, userMsg, currentCount + 1);
            aiReply = callOpenClawCLI(fullPrompt);
            record.setChatHistory(currentHistory + "\n【AI咨询师】: " + aiReply);
            record.setChatCount(currentCount);
        } else {
            String promptTemplate = (config != null && config.getPromptReport() != null) ? config.getPromptReport()
                    : "结合所有对话记录：%s\n生成一份专业的【个人优势评估与岗位推荐报告】，包含核心优势、短板分析、推荐岗位3个部分。使用Markdown格式。";
            fullPrompt = String.format(promptTemplate, currentHistory);
            aiReply = callOpenClawCLI(fullPrompt);

            record.setChatHistory(currentHistory + "\n【AI咨询师】: (已出具最终诊断报告)");
            record.setFinalReport(aiReply);
            record.setStatus("FINISHED");
            isFinished = true;
        }

        consultRecordRepository.save(record);
        return Map.of("reply", aiReply, "isFinished", isFinished, "report", isFinished ? aiReply : "");
    }

    // ==========================================
    // 3. 物理底层：呼叫大模型
    // ==========================================
    private String callOpenClawCLI(String message) {
        StringBuilder result = new StringBuilder();
        // 🚀 修复点5：删除了未使用过的 dtf 变量
        String cleanMsg = message.replace("\n", " ").replace("\r", " ");

        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            String winSafeMsg = cleanMsg.replace("\"", "\"\"");
            try {
                ProcessBuilder pb = new ProcessBuilder("cmd", "/c", "openclaw", "agent", "--agent", "main", "--message", "\"" + winSafeMsg + "\"");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (isNotGarbage(line)) { result.append(line).append("\n"); }
                    }
                }
                process.waitFor();
            } catch (Exception e) {
                // 🚀 修复点6：处理 Empty catch block，打印异常以便排错
                System.err.println("本地物理机调用 AI 失败: " + e.getMessage());
                return "本地 AI 故障";
            }
        } else {
            try {
                new ProcessBuilder("sh", "-c", "docker exec openclaw-aliyun rm -f /root/.openclaw/agents/main/sessions/*.lock").start().waitFor();
            } catch (Exception e) {
                System.err.println("解锁会话失败 (可能本就没有锁): " + e.getMessage());
            }

            String linuxSafeMsg = cleanMsg.replace("'", "'\\''");
            try {
                ProcessBuilder pb = new ProcessBuilder("sh", "-c", "docker exec openclaw-aliyun openclaw agent --agent main --message '" + linuxSafeMsg + "'");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (isNotGarbage(line)) { result.append(line).append("\n"); }
                    }
                }
                process.waitFor();
            } catch (Exception e) {
                System.err.println("云端容器调用 AI 失败: " + e.getMessage());
                return "云端通讯故障";
            }
        }
        return result.toString().trim();
    }

    private boolean isNotGarbage(String line) {
        String l = line.trim();
        return !l.isEmpty() && !l.contains("Gateway") && !l.contains("target:") && !l.contains("Source:") && !l.contains("Config:") && !l.contains("Bind:") && !l.contains("embedded") && !l.contains("ls: cannot access") && !l.contains("No such file") && !l.contains("🦞");
    }
}