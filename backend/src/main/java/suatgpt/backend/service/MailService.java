package suatgpt.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import suatgpt.backend.model.TenantConfig;

import java.util.Properties;

@Service
public class MailService {

    /**
     * 🚀 SaaS 动态发信引擎：物理穿透版
     * 核心逻辑：即时造机 -> 协议适配 -> 变量注入 -> 物理开火
     */
    public void sendDynamicOffer(String targetEmail, String candidateName, String jobTitle, TenantConfig config) throws Exception {

        // 1. 物理安全检查
        if (config.getEmailHost() == null || config.getEmailHost().isBlank()) {
            throw new RuntimeException("❌ [物理阻断] 机构 /" + config.getTenantId() + " 未配置 SMTP Host");
        }
        if (config.getEmailSender() == null || config.getEmailSender().isBlank()) {
            throw new RuntimeException("❌ [物理阻断] 机构 /" + config.getTenantId() + " 未配置发件邮箱地址");
        }

        // 2. 物理造机：动态实例化邮件发送器
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getEmailHost());
        mailSender.setPort(config.getEmailPort() != null ? config.getEmailPort() : 465);
        mailSender.setUsername(config.getEmailSender());
        mailSender.setPassword(config.getEmailPassword());
        mailSender.setDefaultEncoding("UTF-8");

        // 3. 物理协议配置 (针对 SSL/TLS 智能路由)
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");

        // 关键：针对 465 端口开启物理级 SSL 握手
        if (mailSender.getPort() == 465) {
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        } else {
            props.put("mail.smtp.starttls.enable", "true");
        }

        // 增加超时控制，防止线程被无效 SMTP 服务器挂死
        props.put("mail.smtp.connectiontimeout", 5000);
        props.put("mail.smtp.timeout", 5000);

        // 4. 内容物理组装
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // 💡 伪装魔法：设置显示别名。
        // 警告：这里的第一个参数必须等于 mailSender.getUsername()，否则腾讯会报 501 错误。
        String senderAlias = (config.getRemark() != null ? config.getRemark() : "SUAT") + " 人事部";
        helper.setFrom(config.getEmailSender(), senderAlias);

        helper.setTo(targetEmail);

        // 5. 变量动态注入 (%s 占位符处理)
        String subject = String.format(
                (config.getEmailSubject() != null ? config.getEmailSubject() : "录用通知 - %s"),
                candidateName
        );

        // 默认 HTML 模板兜底
        String rawTemplate = (config.getEmailTemplate() != null ? config.getEmailTemplate() :
                "尊敬的 %s：<br><br>恭喜！您已被录用为 <b>%s</b> 岗位。<br>请尽快联系人事部。");

        String htmlContent = String.format(rawTemplate, candidateName, jobTitle);

        helper.setSubject(subject);
        helper.setText(htmlContent, true); // 🚀 开启 HTML 物理渲染支持

        // 6. 物理开火
        try {
            mailSender.send(message);
            System.out.println("✅ [SaaS 发信成功] 租户: " + config.getTenantId() + " -> " + targetEmail);
        } catch (Exception e) {
            System.err.println("🔥 [物理发信炸膛] 原因如下：");
            e.printStackTrace();
            throw e;
        }
    }

    @Deprecated
    public void sendHomework(String to, String subject, String content) {
        throw new UnsupportedOperationException("⛔ 旧版接口已物理封存");
    }
}