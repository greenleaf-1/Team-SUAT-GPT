package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.InterviewRecord;

import java.util.List;

public interface InterviewRecordRepository extends JpaRepository<InterviewRecord, Long> {
    List<InterviewRecord> findByJobId(Long jobId);
}