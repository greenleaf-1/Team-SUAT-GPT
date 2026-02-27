package suatgpt.backend.config;

import org.springframework.stereotype.Component;

/**
 * 物理分离：面试提示词统一管理配置类
 * 集中存放所有 AI 面试相关的 Prompt 模板，方便后续独立修改和维护
 */
@Component
public class InterviewPromptRegistry {

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
            "【物理隔离指令】：你正在面试候选人[%s]。请忽略其他任何人的信息。\n" +
                    "当前岗位：%s\n" +
                    "面试进度：第 %d 轮/共 15 轮\n" +
                    "当前阶段任务：%s\n" +
                    "--- 历史简要 ---\n%s\n" +
                    "--- 候选人最新回答 ---\n%s\n" +
                    "【要求】：请直接给出你作为面试官的追问文字，严禁废话，严禁列表，字数 30 字以内。";

    // ==========================================
    // 3. 物理防御与兜底回复
    // ==========================================
    public static final String FALLBACK_RESPONSE = "了解。那么在这个领域，你认为自己最突出的优势是什么？";
    public static final String ERROR_RESPONSE = "面试官信号不佳。";

    /**
     * 自动判定阶段任务的方法
     */
    public static String getStageTask(int chatCount) {
        if (chatCount <= 6) {
            return STAGE_1_TASK;
        } else if (chatCount <= 12) {
            return STAGE_2_TASK;
        } else {
            return STAGE_3_TASK;
        }
    }
}