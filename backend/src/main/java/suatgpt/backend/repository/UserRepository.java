package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import suatgpt.backend.model.User;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // 1. 保留原有登录逻辑
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    // 2. 🚀 物理植入：5分钟超时清理
    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.status = 'TIMEOUT' WHERE u.role = 'CANDIDATE' AND u.status = 'ACTIVE' AND u.lastHeartbeat < :deadline")
    int clearExpiredInterviews(@Param("deadline") LocalDateTime deadline);
}