package suatgpt.backend.model;

import jakarta.persistence.*;
@Entity
@Table(name = "jobs")

public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;       // 岗位名称
    @Column(columnDefinition = "TEXT")
    private String description; // 详细要求
    @Column(columnDefinition = "TEXT")
    private String status = "OPEN"; // 状态：OPEN/CLOSED
    private String publisher;
    private boolean needsTest; // 🚀 物理记录：是否需要笔试
    @Column(columnDefinition = "LONGTEXT")
    private String adText;

    // 在 Job 类中补全这些方法，删除类顶部的 @Data
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdText() { return adText; }
    public void setAdText(String adText) { this.adText = adText; }
}