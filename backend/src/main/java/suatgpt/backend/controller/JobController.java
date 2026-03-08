package suatgpt.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import suatgpt.backend.model.Job;
import suatgpt.backend.repository.JobRepository;
// 🚀 核心修正：删除 java.nio... 换成您在 config 包下自定义的类
import suatgpt.backend.config.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobRepository jobRepository;

    // 🚀 构造函数注入
    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    /**
     * 1. 发布招聘：保存时物理绑定发布者 ID
     */
    @PostMapping("/publish")
    public Job publish(@RequestBody Job job, @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null) {
            job.setPublisherId(currentUser.getId()); // 自动绑定当前登录人
        }
        return jobRepository.save(job);
    }

    /**
     * 2. 核心：各看各的 (私有管理流)
     */
    @GetMapping("/my-jobs")
    public ResponseEntity<List<Job>> getMyJobs(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        // 直接通过 Repository 查询，物理消除 Cannot resolve symbol 'jobService'
        return ResponseEntity.ok(jobRepository.findByPublisherId(currentUser.getId()));
    }

    /**
     * 3. 核心：公共大厅 (公有展示流)
     * 所有人可见，不区分发布者
     */
    @GetMapping("/public-list")
    public ResponseEntity<List<Job>> getPublicJobs() {
        // 返回所有状态为 OPEN 的职位
        return ResponseEntity.ok(jobRepository.findByStatus("OPEN"));
    }

    /**
     * 4. 兼容旧接口：获取开放中的职位
     */
    @GetMapping("/active")
    public List<Job> getActiveJobs() {
        return jobRepository.findByStatus("OPEN");
    }
}