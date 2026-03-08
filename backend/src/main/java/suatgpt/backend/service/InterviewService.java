package suatgpt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.Job;
import suatgpt.backend.model.InterviewRecord;
import suatgpt.backend.repository.InterviewRecordRepository;
import suatgpt.backend.config.InterviewPromptRegistry;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class InterviewService {

    private final InterviewRecordRepository interviewRecordRepository;

    // 🚀 物理对齐：宿主机路径（Java写入）与容器路径（AI读取）保持一致
    private final String WORKSPACE_HOST = System.getProperty("os.name").toLowerCase().contains("win")
            ? "D:/OpenClawTest"  // Windows 本地路径
            : "/www/wwwroot/suat_data";   // Linux 生产路径
    private final String WORKSPACE_DOCKER = "/root/.openclaw/workspace";

    public InterviewService(InterviewRecordRepository interviewRecordRepository) {
        this.interviewRecordRepository = interviewRecordRepository;
    }

    public String processLiveChat(Long recordId, String userMsg, int chatCount) {
        InterviewRecord record = interviewRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("档案丢失"));

        // 1. 物理对齐：后端打印应聘者的原始信号
        System.out.println("----------------------------------------");
        System.out.println("[" + LocalDateTime.now() + "] 🎤 [应聘者输入]: " + userMsg);

        // 2. 准备 Prompt 载荷
        String resumeContext = "【候选人简历深度画像】：\n" + record.getResumeAnalysis();
        String stageTask = InterviewPromptRegistry.getDynamicStageTask(chatCount, record.getJobTitle());

        String fullPrompt = String.format(
                InterviewPromptRegistry.INTERVIEW_TEMPLATE,
                record.getCandidateName(),
                record.getJobTitle(),
                record.getJobAd() + "\n\n" + resumeContext,
                chatCount,
                stageTask,
                record.getChatHistory() != null ? record.getChatHistory() : "",
                userMsg
        );

        // 3. 呼叫 AI (物理执行)
        String aiReply = callOpenClawCLI(fullPrompt);

        // 🚀 核心优化：物理持久化（把应聘者的话和 AI 的话同时刻进硬盘）
        String currentHistory = record.getChatHistory() != null ? record.getChatHistory() : "";
        String updatedHistory = currentHistory
                + "\n【候选人】: " + userMsg
                + "\n【AI考官】: " + aiReply;

        record.setChatHistory(updatedHistory);
        interviewRecordRepository.save(record); // 💾 物理存档写入

        // 4. 后端输出 AI 信号
        System.out.println("[" + LocalDateTime.now() + "] 🤖 [AI 回复信号]: " + aiReply);
        System.out.println("----------------------------------------");

        return aiReply;
    }

    public String callOpenClawCLI(String message) {
        StringBuilder result = new StringBuilder();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm:ss");

        // 1. 🚀 物理清洗：无论什么环境，先干掉换行，防止指令断裂
        // 云端用单引号包裹，本地用双引号包裹，但内容（Message）必须完全对等
        String cleanMsg = message.replace("\n", " ").replace("\r", " ");

        // 🚀 物理分支 1：Windows 本地真机 (模拟云端全量载荷)
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            // Windows 转义：将内容里的双引号变双双引号，确保几千字的 Prompt 不被截断
            String winSafeMsg = cleanMsg.replace("\"", "\"\"");

            try {
                // 使用数组形式传参，这是 Windows 下传递长文本（几千字简历）最稳的方式
                ProcessBuilder pb = new ProcessBuilder("cmd", "/c", "openclaw", "agent", "--agent", "main", "--message", "\"" + winSafeMsg + "\"");
                pb.redirectErrorStream(true);
                Process process = pb.start();

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (isNotGarbage(line)) {
                            String time = LocalDateTime.now().format(dtf);
                            System.out.println("[" + time + "] 📬 [本地 AI 实况]: " + line);
                            result.append(line).append("\n");
                        }
                    }
                }
                process.waitFor();
            } catch (Exception e) {
                System.err.println("🔥 本地物理链路中断: " + e.getMessage());
                return "本地 AI 故障";
            }
        }
        // 🚀 物理分支 2：云端 Linux/Docker (保持原有成熟逻辑)
        else {
            // 排锁清理
            try {
                new ProcessBuilder("sh", "-c", "docker exec openclaw-aliyun rm -f /root/.openclaw/agents/main/sessions/*.lock").start().waitFor();
            } catch (Exception e) {}

            // Linux 转义：处理单引号刺穿
            String linuxSafeMsg = cleanMsg.replace("'", "'\\''");

            try {
                String fullCommand = "docker exec openclaw-aliyun openclaw agent --agent main --message '" + linuxSafeMsg + "'";
                ProcessBuilder pb = new ProcessBuilder("sh", "-c", fullCommand);
                pb.redirectErrorStream(true);
                Process process = pb.start();

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (isNotGarbage(line)) {
                            String time = LocalDateTime.now().format(dtf);
                            System.out.println("[" + time + "] 📬 [云端 AI 实况]: " + line);
                            result.append(line).append("\n");
                        }
                    }
                }
                process.waitFor();
            } catch (Exception e) {
                return "云端通讯故障";
            }
        }

        return result.toString().trim();
    }


    public String automatedWorkflow(String jobDemand) {
        String adPrompt = "### 任务：专业招聘广告撰写 ###\n" +
                "【原始需求】：" + jobDemand + "\n" +
                "【要求】：请作为 HR 专家给出 Markdown 格式招聘广告。";
        return callOpenClawCLI(adPrompt);
    }

    private boolean isNotGarbage(String line) {
        String l = line.trim();
        return !l.isEmpty()
                && !l.contains("Gateway")
                && !l.contains("target:")
                && !l.contains("Source:")
                && !l.contains("Config:")
                && !l.contains("Bind:")
                && !l.contains("embedded")
                && !l.contains("ls: cannot access")
                && !l.contains("No such file")
                && !l.contains("🦞");
    }

    public Map<String, Object> processResumeUpload(MultipartFile file, Job job, String candidateName, String email) throws Exception {
        // 1. 物理检查并创建宿主机目录
        File dir = new File(WORKSPACE_HOST);
        if (!dir.exists()) dir.mkdirs();

        // 🚀 物理去毒：强制对文件名进行重命名，仅保留时间戳+后缀
        // 彻底消灭文件名中的“空格、括号、中文乱码”导致的 Linux 路径识别失败
        String originalName = file.getOriginalFilename();
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")) : ".docx";
        String safeName = System.currentTimeMillis() + extension;

        File destFile = new File(dir, safeName);
        file.transferTo(destFile);

        // 🚀 物理路径转换：Java 写到宿主机，指令告诉容器内部路径
        // 注意：这里给路径加上单引号包裹，确保 AI 即使遇到古怪路径也能精准定位
        String dockerFilePath = WORKSPACE_DOCKER + "/" + safeName;

        String analysisPrompt = String.format(
                "### 核心任务：简历深度评估 ###\n" +
                        "【1. 招聘需求】：%s\n" +
                        "【2. 简历路径】：'%s'\n" +
                        "【3. 目标岗位】：'%s'\n\n" +
                        "【指令】：请忽略之前对话中的一切信息，不与前面的对话记录关联，根据招聘需求对该路径下的简历进行深度扫描。禁止泛泛而谈，必须输出：\n" +
                        "1. **岗位匹配度**：结合招聘需求中的技术栈/经验进行评分；\n" +
                        "2. **简历真伪甄别**：找出逻辑矛盾点；\n" +
                        "3. **面试官开场白**：基于简历中的槽点或亮点，给出前 3 轮面试的切入问题。\n" +
                        "请直接输出 Markdown 报告。",
                job.getAdText(),  // 🚀 物理注入点：部长的招聘公告
                dockerFilePath,
                job.getTitle()
        );

        String analysisResult = callOpenClawCLI(analysisPrompt);

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
}