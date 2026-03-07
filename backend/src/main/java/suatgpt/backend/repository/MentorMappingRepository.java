// MentorMappingRepository.java
package suatgpt.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.HomeworkRecord;
import suatgpt.backend.model.MentorMapping;
import java.util.Optional;

public interface MentorMappingRepository extends JpaRepository<MentorMapping, Long> {
    Optional<MentorMapping> findByStudentName(String studentName);
    Optional<MentorMapping> findByStudentId(String studentId);
}

// HomeworkRecordRepository.java
