package suatgpt.backend.config;

import org.springframework.stereotype.Component;

/**
 * 物理分离：面试提示词统一管理配置类
 * 集中存放所有 AI 面试相关的 Prompt 模板，方便后续独立修改和维护
 */
@Component
public class InterviewPromptRegistry {

    // 🚀 定制化出题模板：融合简历 + 岗位公告
// 修改 Registry 里的模板，只留 2 个坑位
    public static final String WRITTEN_TEST_GENERATE_TEMPLATE =
            "### 任务：定制化笔试命题 ###\n" +
                    "【岗位要求】：%s\n" +
                    "【简历评估】：%s\n" +
                    "【要求】：请作为资深教研员，基于上述信息出 3 道笔试题，涵盖专业能力、情境模拟与教学实战。直接给出题目。";

    // 🚀 阅卷评估模板
    public static final String WRITTEN_TEST_EVAL_TEMPLATE =
            "### 任务：物理阅卷评估 ###\n" +
                    "【题目内容】：%s\n" +
                    "【候选人作答】：%s\n" +
                    "【评估准则】：逻辑性、专业度、与岗位的匹配感。\n" +
                    "请给出：1. 评分(0-100)；2. 优缺点分析(50字内)；3. 面试追问建议。";


    // ==========================================
    // 1. 面试各阶段任务指令
    // ==========================================
    public static final String STAGE_1_TASK = "【阶段一：专业挖掘】。请针对回答进行技能细节追问。";
    public static final String STAGE_2_TASK = "【阶段二：综合素质】。请转向询问抗压能力、团队合作或赛事经验。";
    public static final String STAGE_3_TASK = "【阶段三：入职条件】。请询问薪资、到岗时间。";

    // ==========================================
    // 2. 核心 Prompt 模板 (留出 %s 和 %d 供代码填空)
    // ==========================================
    public static final String INTERVIEW_TEMPLATE =
            "## 系统设定：面试官模式 ##\n" +
                    "【面试对象】：%s | 【应聘岗位】：%s\n" +
                    "【岗位详情】：%s\n" + // 🚀 确保这里承接数据库里的 jobAd
                    "【当前进度】：第 %d 轮 / 15 轮\n" +
                    "【当前任务】：%s\n" +
                    "--- 历史背景 ---\n%s\n" +
                    "--- 候选人回答 ---\n%s\n" +
                    "【物理指令】：请结合岗位要求，对候选人刚才的回答进行 30 字以内的专业追问。" +
                    "如果是第 15 轮，请在结尾附加 [INTERVIEW_DONE] 并给出录用建议。";
    // 🚀 删除了多余的分号，优化了结构，防止 AI 抓取整个字符串复读

    // ==========================================
    // 3. 物理防御与兜底回复
    // ==========================================
    public static final String FALLBACK_RESPONSE = "了解。那么在这个领域，你认为自己最突出的优势是什么？";
    public static final String ERROR_RESPONSE = "面试官信号不佳。";

    // ==========================================
// 4. 🚀 新增：物理初筛专用指令 (用于 upload 接口)
// ==========================================
    public static final String RESUME_ANALYSIS_TEMPLATE =
            "【物理隔离指令】：你现在是招聘专家。请对以下路径的简历进行深度物理扫描。文件路径：[%s]\n" +
                    "当前岗位：[%s]\n" +
                    "【执行要求】：\n" +
                    "1. 必须给出 1-100 的物理匹配分。\n" +
                    "2. 采用 Markdown 表格列出：优势项、劣势项、关键亮点。\n" +
                    "3. 最后请以面试官身份说一句开场白，准备进入 15 轮面试。\n" +
                    "4. 严禁复读路径，严禁输出二进制乱码。";

    public static final String RESUME_FALLBACK = "简历解析成功，虽然格式略显复杂，但我已准备好进行专业面试。";
    /**
     * 自动判定阶段任务的方法
     */
    public static String getDynamicStageTask(int chatCount, String jobTitle) {
        if (chatCount <= 6) {
            return STAGE_1_TASK;
        } else if (chatCount <= 12) {
            return STAGE_2_TASK;
        } else {
            return STAGE_3_TASK;
        }
    }
}