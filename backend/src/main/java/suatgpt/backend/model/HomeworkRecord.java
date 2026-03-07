package suatgpt.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class HomeworkRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String studentName;
    private String studentId;
    private String mentorName;
    private Integer weekNumber; // 汇报周次 (1-16)

    @Column(columnDefinition = "TEXT")
    private String aiEvaluation; // AI 审计报告

    @Column(columnDefinition = "TEXT")
    private String chatHistory; // 助教质询实录

    private String status; // SUBMITTED, REJECTED, APPROVED
    private LocalDateTime submitTime;

    @PrePersist
    protected void onCreate() { submitTime = LocalDateTime.now(); }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }
    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }
    public String getAiEvaluation() { return aiEvaluation; }
    public void setAiEvaluation(String aiEvaluation) { this.aiEvaluation = aiEvaluation; }
    public String getChatHistory() { return chatHistory; }
    public void setChatHistory(String chatHistory) { this.chatHistory = chatHistory; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSubmitTime() { return submitTime; }
    public void setSubmitTime(LocalDateTime submitTime) { this.submitTime = submitTime; }
}