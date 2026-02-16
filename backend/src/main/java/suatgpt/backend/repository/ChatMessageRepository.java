
package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.ChatMessage;
import suatgpt.backend.model.User;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);

    // 通过关联的 session 及其 user 进行查询
    List<ChatMessage> findBySessionUserOrderByTimestampAsc(User user);
}
