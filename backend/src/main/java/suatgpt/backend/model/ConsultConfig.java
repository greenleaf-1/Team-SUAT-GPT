package suatgpt.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consult_configs")
public class ConsultConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", unique = true, nullable = false)
    private String tenantId;

    @Column(name = "remark")
    private String remark;

    // ================= 🎨 前端 UI 定制区 =================
    @Column(name = "ui_page_title")
    private String uiPageTitle;

    @Column(name = "ui_welcome_msg")
    private String uiWelcomeMsg;

    @Column(name = "ui_btn_text")
    private String uiBtnText;

    // ================= 🧠 AI 提示词定制区 =================
    @Column(name = "prompt_greeting", columnDefinition = "LONGTEXT")
    private String promptGreeting;

    @Column(name = "prompt_interview", columnDefinition = "LONGTEXT")
    private String promptInterview;

    @Column(name = "prompt_report", columnDefinition = "LONGTEXT")
    private String promptReport;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ================= Getter & Setter (物理补全) =================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public String getUiPageTitle() { return uiPageTitle; }
    public void setUiPageTitle(String uiPageTitle) { this.uiPageTitle = uiPageTitle; }

    public String getUiWelcomeMsg() { return uiWelcomeMsg; }
    public void setUiWelcomeMsg(String uiWelcomeMsg) { this.uiWelcomeMsg = uiWelcomeMsg; }

    public String getUiBtnText() { return uiBtnText; }
    public void setUiBtnText(String uiBtnText) { this.uiBtnText = uiBtnText; }

    public String getPromptGreeting() { return promptGreeting; }
    public void setPromptGreeting(String promptGreeting) { this.promptGreeting = promptGreeting; }

    public String getPromptInterview() { return promptInterview; }
    public void setPromptInterview(String promptInterview) { this.promptInterview = promptInterview; }

    public String getPromptReport() { return promptReport; }
    public void setPromptReport(String promptReport) { this.promptReport = promptReport; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}