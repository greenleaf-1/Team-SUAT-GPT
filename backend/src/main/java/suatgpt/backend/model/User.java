package suatgpt.backend.model;

import jakarta.persistence.*;
// 移除了未使用的 java.util.Set 导入
// import java.util.Set;

/**
 * 用户实体类
 * 存储用户基本信息和认证信息，是 Spring Security 认证的主体对象。
 * @Entity: 声明这是一个 JPA 实体
 * @Table: 映射到数据库中的 users 表
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * 主键 ID，自增
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户名。
     * @Column(nullable = false, unique = true): 非空且唯一，用于登录。
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * 密码。
     * @Column(nullable = false): 非空。存储的是 BCrypt 加密后的字符串。
     */
    @Column(nullable = false)
    private String password; // 存储加密后的密码

    /**
     * 用户角色。
     * 这里简化为单个字符串 "USER"，但在实际应用中可以扩展为权限集合。
     */
    private String role = "USER";

    // 构造函数：JPA 需要无参构造函数
    public User() {
    }

    /**
     * 常用构造函数
     * @param username 用户名
     * @param password 原始密码或已加密的密码（取决于调用方）
     */
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}