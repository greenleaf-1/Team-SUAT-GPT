package suatgpt.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "jobs")
@Data
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;       // 岗位名称
    @Column(columnDefinition = "TEXT")
    private String description; // 详细要求
    @Column(columnDefinition = "TEXT")
    private String adText;      // AI 生成的文案
    private String status = "OPEN"; // 状态：OPEN/CLOSED
}