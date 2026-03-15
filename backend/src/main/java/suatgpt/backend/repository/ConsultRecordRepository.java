package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.ConsultRecord;

public interface ConsultRecordRepository extends JpaRepository<ConsultRecord, Long> {
}