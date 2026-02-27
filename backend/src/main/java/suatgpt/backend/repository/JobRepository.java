package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import suatgpt.backend.model.Job;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // 🚀 物理过滤：只查询处于“开放”状态的岗位
    List<Job> findByStatus(String status);
}