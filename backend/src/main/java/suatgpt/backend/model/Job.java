package suatgpt.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    private String publisher;   // 发布人姓名（冗余存储）

    private boolean needsTest;  // 🚀 物理记录：是否需要笔试

    @Column(columnDefinition = "LONGTEXT")
    private String adText;

    // 🚀 核心加固：增加 JsonProperty 注解，强制 Jackson 输出该字段
    @JsonProperty("publisherId")
    @Column(name = "publisher_id")
    private Long publisherId;

    // --- 构造函数 ---
    public Job() {}

    // --- 物理对齐的 Getter & Setter ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public boolean isNeedsTest() {
        return needsTest;
    }

    public void setNeedsTest(boolean needsTest) {
        this.needsTest = needsTest;
    }

    public String getAdText() {
        return adText;
    }

    public void setAdText(String adText) {
        this.adText = adText;
    }

    // 🚀 关键：Getter 方法必须完全符合 Bean 规范，Jackson 才能识别
    public Long getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(Long publisherId) {
        this.publisherId = publisherId;
    }
}