package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import suatgpt.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 1. 保留原有登录与存在性校验逻辑
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    // 🚀 2. 物理修复：招聘管理所需的筛选逻辑
    // 对应报错：return userRepository.findByRoleAndStatusNot("CANDIDATE", "GUEST");
    List<User> findByRoleAndStatusNot(String role, String status);

    // 🚀 3. 高级筛选（可选）：直接找出所有处于面试状态（非游客）的候选人
    @Query("SELECT u FROM User u WHERE u.role = 'CANDIDATE' AND u.status <> 'GUEST'")
    List<User> findAllActiveCandidates();

    // 4. 物理植入：5分钟超时清理
    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.status = 'TIMEOUT' WHERE u.role = 'CANDIDATE' AND u.status = 'ACTIVE' AND u.lastHeartbeat < :deadline")
    int clearExpiredInterviews(@Param("deadline") LocalDateTime deadline);
}