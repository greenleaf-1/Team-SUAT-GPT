package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import suatgpt.backend.model.Job;
import java.util.List;

@Repository


public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(String status);
    List<Job> findByPublisherId(Long publisherId); // 🚀 对应 getMyJobs
}