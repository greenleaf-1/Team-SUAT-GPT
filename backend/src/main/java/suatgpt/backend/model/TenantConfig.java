package suatgpt.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 🚀 SaaS 平行分身核心配置表
 * 承载了：身份路由、AI提示词、邮件物理参数、前端UI定制
 */
@Entity
@Table(name = "tenant_configs")
public class TenantConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", unique = true, nullable = false)
    private String tenantId;        // 1. 路由后缀 (如: recruit)

    @Column(name = "remark")
    private String remark;          // 2. 系统备注 (如: SUAT教研部)

    // ================== 🧠 AI 大脑提示词区 ==================
    @Column(name = "prompt_interview", columnDefinition = "LONGTEXT")
    private String promptInterview; // 3. 面试官核心指令

    @Column(name = "prompt_resume", columnDefinition = "LONGTEXT")
    private String promptResume;    // 4. 简历初筛指令

    @Column(name = "prompt_ad", columnDefinition = "LONGTEXT")
    private String promptAd;        // 5. 招聘公告润色指令

    // ================== ✉️ 邮件引擎物理参数 ==================
    @Column(name = "email_sender")
    private String emailSender;     // 6. 发件邮箱

    @Column(name = "email_password")
    private String emailPassword;   // 7. SMTP 授权码

    @Column(name = "email_host")
    private String emailHost;       // 🚀 新增：SMTP服务器地址 (如: smtp.exmail.qq.com)

    @Column(name = "email_port")
    private Integer emailPort;      // 🚀 新增：SMTP端口 (如: 465)

    @Column(name = "email_subject")
    private String emailSubject;    // 8. 录用邮件标题

    @Column(name = "email_template", columnDefinition = "LONGTEXT")
    private String emailTemplate;   // 9. 录用邮件正文

    // ================== 🎨 前端 UI 界面定制 ==================
    @Column(name = "ui_title")
    private String uiTitle;         // 系统主标题

    @Column(name = "ui_subtitle")
    private String uiSubtitle;      // 系统副标题

    @Column(name = "ui_btn_text")
    private String uiBtnText;       // 生成按钮文案

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ==========================================
    // 🏗️ 物理支撑：Getter & Setter (请勿遗漏)
    // ==========================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public String getPromptInterview() { return promptInterview; }
    public void setPromptInterview(String promptInterview) { this.promptInterview = promptInterview; }

    public String getPromptResume() { return promptResume; }
    public void setPromptResume(String promptResume) { this.promptResume = promptResume; }

    public String getPromptAd() { return promptAd; }
    public void setPromptAd(String promptAd) { this.promptAd = promptAd; }

    public String getEmailSender() { return emailSender; }
    public void setEmailSender(String emailSender) { this.emailSender = emailSender; }

    public String getEmailPassword() { return emailPassword; }
    public void setEmailPassword(String emailPassword) { this.emailPassword = emailPassword; }

    public String getEmailHost() { return emailHost; }
    public void setEmailHost(String emailHost) { this.emailHost = emailHost; }

    public Integer getEmailPort() { return emailPort; }
    public void setEmailPort(Integer emailPort) { this.emailPort = emailPort; }

    public String getEmailSubject() { return emailSubject; }
    public void setEmailSubject(String emailSubject) { this.emailSubject = emailSubject; }

    public String getEmailTemplate() { return emailTemplate; }
    public void setEmailTemplate(String emailTemplate) { this.emailTemplate = emailTemplate; }

    public String getUiTitle() { return uiTitle; }
    public void setUiTitle(String uiTitle) { this.uiTitle = uiTitle; }

    public String getUiSubtitle() { return uiSubtitle; }
    public void setUiSubtitle(String uiSubtitle) { this.uiSubtitle = uiSubtitle; }

    public String getUiBtnText() { return uiBtnText; }
    public void setUiBtnText(String uiBtnText) { this.uiBtnText = uiBtnText; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}