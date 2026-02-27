package suatgpt.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import suatgpt.backend.repository.UserRepository;
import java.time.LocalDateTime;

/**
 * 自动巡逻服务
 * 负责物理扫描数据库，清理超过5分钟未交互的求职者
 */
@Service
public class InterviewCleanupService {

    private final UserRepository userRepository;

    public InterviewCleanupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 自动执行逻辑：每 30 秒扫描一次
     * fixedRate = 30000 毫秒 = 30 秒
     */
    @Scheduled(fixedRate = 30000)
    public void cleanupTask() {
        // 定义“物理死亡线”：当前时间往前推 5 分钟
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(5);

        // 调用我们之前在 UserRepository 里写好的物理清理方法
        int count = userRepository.clearExpiredInterviews(deadline);

        if (count > 0) {
            // 在控制台打印物理日志，方便你（部长）监控系统运行
            System.out.println("【系统巡警】检测到物理超时！已取消 " + count + " 名求职者的面试资格。时间：" + LocalDateTime.now());
        }
    }
}