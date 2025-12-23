package suatgpt.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 聊天消息实体类
 * 记录用户和 AI 的每一次交互，用于持久化聊天历史记录。
 */
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    /**
     * 主键 ID，自增
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 多对一关系：多条消息对应一个用户。
     * fetch = FetchType.LAZY: 延迟加载 User 实体，提高性能。
     * @JoinColumn: 指定外键列名为 user_id。
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 关联到哪个用户

    /**
     * 消息发送方：通常是 "USER" 或 "AI"
     */
    @Column(nullable = false)
    private String sender; 

    /**
     * 消息内容。使用 TEXT 类型以支持较长的聊天文本。
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; 

    /**
     * 消息创建时间，默认为当前时间。
     */
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now(); 

    // 构造函数：JPA 需要无参构造函数
    public ChatMessage() {
    }

    /**
     * 常用构造函数

     * @param user 关联的用户实体
     * @param sender 消息发送方 (USER/AI)
     * @param content 消息内容
     */
    public ChatMessage(User user, String sender, String content) {
        this.user = user;
        this.sender = sender;
        this.content = content;
    }
// src/main/java/suatgpt/backend/model/ChatMessage.java

// ... (保持所有原有内容不变) ...

    /**
     * 新增的完整构造函数
     * @param user 关联的用户实体
     * @param sender 消息发送方 (USER/AI)
     * @param content 消息内容
     * @param timestamp 消息创建时间
     */
    public ChatMessage(User user, String sender, String content, LocalDateTime timestamp) {
        this.user = user;
        this.sender = sender;
        this.content = content;
        // 注意：这里显式接收并设置时间戳，覆盖了字段的默认值
        this.timestamp = timestamp; 
    }

// ... (保持所有 Getters and Setters 不变) ...

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}