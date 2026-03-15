package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.ConsultConfig;
import java.util.Optional;

public interface ConsultConfigRepository extends JpaRepository<ConsultConfig, Long> {
    Optional<ConsultConfig> findByTenantId(String tenantId);
}