package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.User;
import java.util.Optional;

/**
 * 用户数据访问接口 (Repository)
 * 继承 JpaRepository，提供了对 User 实体进行基本的 CRUD (创建、读取、更新、删除) 操作的能力。
 * <User, Long>：第一个参数是 JPA 实体类型 (User)，第二个参数是该实体主键的类型 (Long)。
 */
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * 自定义查询方法：根据用户名（username 字段）查找用户。
     * 遵循 Spring Data JPA 命名规范，框架会自动实现该方法。
     *
     * @param username 用户名字符串
     * @return 包含用户的 Optional 对象。如果未找到，则返回 Optional.empty()。
     */
    Optional<User> findByUsername(String username);

    /**
     * 自定义查询方法：检查数据库中是否存在具有指定用户名的记录。
     * 遵循 Spring Data JPA 命名规范，用于快速判断用户注册时用户名是否已被占用。
     *
     * @param username 用户名字符串
     * @return 如果用户名存在，返回 true；否则返回 false。
     */
    boolean existsByUsername(String username);
}