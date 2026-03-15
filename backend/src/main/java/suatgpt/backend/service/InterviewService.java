package suatgpt.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.Job;
import suatgpt.backend.model.InterviewRecord;
import suatgpt.backend.model.TenantConfig;
import suatgpt.backend.repository.InterviewRecordRepository;
import suatgpt.backend.repository.TenantConfigRepository;
import suatgpt.backend.config.InterviewPromptRegistry;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class InterviewService {

    private final InterviewRecordRepository interviewRecordRepository;

    // 🚀 注入分身配置仓库
    private final TenantConfigRepository tenantConfigRepository;

    private final String WORKSPACE_HOST = System.getProperty("os.name").toLowerCase().contains("win")
            ? "D:/OpenClawTest"
            : "/www/wwwroot/suat_data";
    private final String WORKSPACE_DOCKER = "/root/.openclaw/workspace";

    @Autowired
    public InterviewService(InterviewRecordRepository interviewRecordRepository, TenantConfigRepository tenantConfigRepository) {
        this.interviewRecordRepository = interviewRecordRepository;
        this.tenantConfigRepository = tenantConfigRepository;
    }

    // ==========================================
    // 🚀 1. 动态大脑：15 轮面试对话引擎
    // ==========================================
    public String processLiveChat(Long recordId, String userMsg, int chatCount, String tenantId) {
        InterviewRecord record = interviewRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("档案丢失"));

        System.out.println("----------------------------------------");
        System.out.println("[" + LocalDateTime.now() + "] 🎤 [应聘者输入]: " + userMsg);

        // 💡 提取该分身专属的面试官提示词
        TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(null);
        String interviewPromptTemplate = (config != null && config.getPromptInterview() != null && !config.getPromptInterview().isEmpty())
                ? config.getPromptInterview()
                : InterviewPromptRegistry.INTERVIEW_TEMPLATE; // 兜底：用您原来写死在 Registry 里的模板

        String resumeContext = "【候选人简历深度画像】：\n" + record.getResumeAnalysis();
        String stageTask = InterviewPromptRegistry.getDynamicStageTask(chatCount, record.getJobTitle());

        // 灵魂注入
        String fullPrompt = String.format(
                interviewPromptTemplate,
                record.getCandidateName(),
                record.getJobTitle(),
                record.getJobAd() + "\n\n" + resumeContext,
                chatCount,
                stageTask,
                record.getChatHistory() != null ? record.getChatHistory() : "",
                userMsg
        );

        String aiReply = callOpenClawCLI(fullPrompt);

        String currentHistory = record.getChatHistory() != null ? record.getChatHistory() : "";
        String updatedHistory = currentHistory
                + "\n【候选人】: " + userMsg
                + "\n【AI考官】: " + aiReply;

        record.setChatHistory(updatedHistory);
        interviewRecordRepository.save(record);

        System.out.println("[" + LocalDateTime.now() + "] 🤖 [AI 回复信号]: " + aiReply);
        System.out.println("----------------------------------------");

        return aiReply;
    }

    // ==========================================
    // 🚀 2. 动态大脑：简历物理初筛引擎
    // ==========================================
    // ==========================================
    // 🚀 2. 动态大脑：简历物理初筛引擎 (已修复路径自适应)
    // ==========================================
    public Map<String, Object> processResumeUpload(MultipartFile file, Job job, String candidateName, String email, String tenantId) throws Exception {
        // 1. 物理检查并创建宿主机目录
        File dir = new File(WORKSPACE_HOST);
        if (!dir.exists()) dir.mkdirs();

        // 2. 强制对文件名进行重命名防乱码
        String originalName = file.getOriginalFilename();
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")) : ".docx";
        String safeName = System.currentTimeMillis() + extension;

        // 3. 物理落盘
        File destFile = new File(dir, safeName);
        file.transferTo(destFile);

        // 🚀【核心修复】：动态路径路由，适应 Windows 本机与 Linux 云端
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        String aiReadablePath = isWindows
                ? (WORKSPACE_HOST + "/" + safeName)   // Windows：直接给 D:/OpenClawTest/xxx
                : (WORKSPACE_DOCKER + "/" + safeName); // Linux/Docker：给容器映射路径

        // 4. 提取该分身专属的简历解析指令
        TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(null);
        String resumePromptTemplate = (config != null && config.getPromptResume() != null && !config.getPromptResume().isEmpty())
                ? config.getPromptResume()
                : "### 核心任务：简历深度评估 ###\n【1. 招聘需求】：%s\n【2. 简历路径】：'%s'\n【3. 目标岗位】：'%s'\n\n【指令】：请根据需求扫描该路径简历，给出：1.匹配度打分 2.矛盾点 3.开场白。";

        // 5. 灵魂注入（注意这里传入的是智能判断后的 aiReadablePath）
        String analysisPrompt = String.format(
                resumePromptTemplate,
                job.getAdText(),
                aiReadablePath,   // ⬅️ 这里传入了正确的路径
                job.getTitle()
        );

        // 6. 呼叫大模型解析
        String analysisResult = callOpenClawCLI(analysisPrompt);

        // 7. 物理刻录入库
        InterviewRecord record = new InterviewRecord();
        record.setJobId(job.getId());
        record.setJobTitle(job.getTitle());
        record.setJobAd(job.getAdText());
        record.setCandidateName(candidateName);
        record.setEmail(email);
        record.setResumeAnalysis(analysisResult);
        record.setStatus("APPLIED");
        interviewRecordRepository.save(record);

        return Map.of("code", 200, "analysis", analysisResult, "recordId", record.getId());
    }

    // ==========================================
    // 🚀 3. 动态大脑：部长发广告润色引擎
    // ==========================================
    public String automatedWorkflow(String jobDemand, String tenantId) {
        // 💡 提取该分身专属的广告生成指令
        TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(null);
        String baseAdPrompt = (config != null && config.getPromptAd() != null && !config.getPromptAd().isEmpty())
                ? config.getPromptAd()
                : "### 任务：专业招聘广告撰写 ###\n要求：请作为 HR 专家给出 Markdown 格式招聘广告。";

        String finalPrompt = baseAdPrompt + "\n【部长原始需求】：" + jobDemand;

        return callOpenClawCLI(finalPrompt);
    }

    // ==========================================
    // 物理底层：呼叫大模型 (保持不变)
    // ==========================================
    public String callOpenClawCLI(String message) {
        StringBuilder result = new StringBuilder();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm:ss");
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
                        if (isNotGarbage(line)) {
                            System.out.println("[" + LocalDateTime.now().format(dtf) + "] 📬 [本地 AI 实况]: " + line);
                            result.append(line).append("\n");
                        }
                    }
                }
                process.waitFor();
            } catch (Exception e) { return "本地 AI 故障"; }
        } else {
            try { new ProcessBuilder("sh", "-c", "docker exec openclaw-aliyun rm -f /root/.openclaw/agents/main/sessions/*.lock").start().waitFor(); } catch (Exception e) {}
            String linuxSafeMsg = cleanMsg.replace("'", "'\\''");
            try {
                ProcessBuilder pb = new ProcessBuilder("sh", "-c", "docker exec openclaw-aliyun openclaw agent --agent main --message '" + linuxSafeMsg + "'");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (isNotGarbage(line)) {
                            System.out.println("[" + LocalDateTime.now().format(dtf) + "] 📬 [云端 AI 实况]: " + line);
                            result.append(line).append("\n");
                        }
                    }
                }
                process.waitFor();
            } catch (Exception e) { return "云端通讯故障"; }
        }
        return result.toString().trim();
    }

    private boolean isNotGarbage(String line) {
        String l = line.trim();
        return !l.isEmpty() && !l.contains("Gateway") && !l.contains("target:") && !l.contains("Source:") && !l.contains("Config:") && !l.contains("Bind:") && !l.contains("embedded") && !l.contains("ls: cannot access") && !l.contains("No such file") && !l.contains("🦞");
    }
}