package suatgpt.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import suatgpt.backend.model.HomeworkRecord;
import java.util.List;
import java.util.Optional;

public interface HomeworkRecordRepository extends JpaRepository<HomeworkRecord, Long> {

    // 🚀 物理关键：支持按导师过滤并按周次倒序
    List<HomeworkRecord> findByMentorNameOrderByWeekNumberDesc(String mentorName);

    // 🚀 王松老师视角：获取全量数据
    List<HomeworkRecord> findAllByOrderByWeekNumberDesc();

    // 🚀 核心纠偏：支持通过学号+周次精准定位唯一记录（用于覆盖提交）
    Optional<HomeworkRecord> findByStudentIdAndWeekNumber(String studentId, Integer weekNumber);

    // 兼容性保留（如有需要）
    List<HomeworkRecord> findByStudentId(String studentId);
}