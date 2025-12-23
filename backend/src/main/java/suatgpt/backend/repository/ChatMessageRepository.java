package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.ChatMessage;
import suatgpt.backend.model.User;
import java.util.List;

/**
 * 聊天消息数据访问接口 (Repository)
 * 继承 JpaRepository，提供了对 ChatMessage 实体进行基本的 CRUD (创建、读取、更新、删除) 操作的能力。
 * <ChatMessage, Long>：第一个参数是 JPA 实体类型 (ChatMessage)，第二个参数是该实体主键的类型 (Long)。
 */
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    /**
     * 自定义查询方法：根据关联的 User 实体查找所有 ChatMessage 记录，
     * 并按照消息创建时间 (timestamp) 升序 (Ascending) 排列。
     * * 这个方法遵循 Spring Data JPA 的命名规范，Spring 会自动解析方法名并生成对应的 SQL 查询。
     *
     * 命名解析：
     * - findBy: 查找操作
     * - User: 对应 ChatMessage 实体中的 user 字段 (外键关联)
     * - OrderBy: 排序关键字
     * - Timestamp: 对应 ChatMessage 实体中的 timestamp 字段
     * - Asc: 升序排列 (最旧的消息在前)
     *
     * @param user 用户实体对象，用于过滤消息记录
     * @return 属于该用户的所有聊天记录列表，按时间先后顺序排列
     */
    List<ChatMessage> findByUserOrderByTimestampAsc(User user);
}