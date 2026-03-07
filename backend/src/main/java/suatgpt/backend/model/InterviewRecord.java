package suatgpt.backend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "interview_records")
public class InterviewRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id")
    private Long jobId;


    // 🚀 物理对齐：岗位名称（用于邮件通知）
    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "candidate_name")
    private String candidateName;

    // 🚀 物理对齐：候选人邮箱（用于发送入职通知书）
    @Column(name = "email")
    private String email; // 🚀 新增物理字段

    @Column(name = "file_name")
    private String fileName;

    // 🚀 1. 环节控制与状态
    @Column(name = "needs_written_test")
    private boolean needsWrittenTest = true;

    @Column(name = "status")
    private String status = "APPLIED"; // APPLIED, TESTING, INTERVIEWING, INTERRUPTED, HIRED, REJECTED

    // 🚀 2. 简历环节：初筛评估
    @Column(name = "resume_analysis", columnDefinition = "LONGTEXT")
    private String resumeAnalysis;

    // 🚀 3. 笔试环节：题目、作答、AI 阅卷
    @Column(name = "written_test_paper", columnDefinition = "TEXT")
    private String writtenTestPaper;

    @Column(name = "written_test_answer", columnDefinition = "TEXT")
    private String writtenTestAnswer;

    @Column(name = "written_test_evaluation", columnDefinition = "TEXT")
    private String writtenTestEvaluation;

    @Column(name = "job_ad", columnDefinition = "TEXT")

    private String jobAd;

    // 🚀 4. 面试环节：全量 15 轮实况监控
    @Column(name = "chat_history", columnDefinition = "LONGTEXT")
    private String chatHistory;



    // 🚀 5. 面试日期
    @Column(name = "interview_date")
    private Date interviewDate = new Date();

    // 兼容性字段：如果旧代码还在调用 setQuestions，将其映射到笔试卷
    public void setQuestions(String q) { this.writtenTestPaper = q; }

    // ==========================================
    // 🚀 物理对齐：所有 Getter & Setter
    // ==========================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    // ✅ 修复报错：getJobTitle
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    // ✅ 修复报错：getEmail
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public boolean isNeedsWrittenTest() { return needsWrittenTest; }
    public void setNeedsWrittenTest(boolean needsWrittenTest) { this.needsWrittenTest = needsWrittenTest; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResumeAnalysis() { return resumeAnalysis; }
    public void setResumeAnalysis(String resumeAnalysis) { this.resumeAnalysis = resumeAnalysis; }

    public String getWrittenTestPaper() { return writtenTestPaper; }
    public void setWrittenTestPaper(String writtenTestPaper) { this.writtenTestPaper = writtenTestPaper; }

    public String getWrittenTestAnswer() { return writtenTestAnswer; }
    public void setWrittenTestAnswer(String writtenTestAnswer) { this.writtenTestAnswer = writtenTestAnswer; }

    public String getWrittenTestEvaluation() { return writtenTestEvaluation; }
    public void setWrittenTestEvaluation(String writtenTestEvaluation) { this.writtenTestEvaluation = writtenTestEvaluation; }

    public String getChatHistory() { return chatHistory; }
    public void setChatHistory(String chatHistory) { this.chatHistory = chatHistory; }

    public Date getInterviewDate() { return interviewDate; }
    public void setInterviewDate(Date interviewDate) { this.interviewDate = interviewDate; }
    public String getJobAd() { return jobAd; }
    public void setJobAd(String jobAd) { this.jobAd = jobAd; }

}