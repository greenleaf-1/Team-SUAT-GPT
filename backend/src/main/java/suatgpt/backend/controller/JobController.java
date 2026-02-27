package suatgpt.backend.controller;

import org.springframework.web.bind.annotation.*;
import suatgpt.backend.model.Job;
import suatgpt.backend.repository.JobRepository;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {
    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @PostMapping("/publish")
    public Job publish(@RequestBody Job job) {
        return jobRepository.save(job);
    }

    @GetMapping("/active")
    public List<Job> getActiveJobs() {
        return jobRepository.findByStatus("OPEN");
    }
}