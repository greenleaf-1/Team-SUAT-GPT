package suatgpt.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import suatgpt.backend.model.ConsultConfig;
import suatgpt.backend.repository.ConsultConfigRepository;
import suatgpt.backend.service.ConsultService;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/consult")
@CrossOrigin(origins = "*")
public class ConsultController {

    @Autowired
    private ConsultService consultService;
    @Autowired
    private ConsultConfigRepository consultConfigRepository;

    // ==========================================
    // 🛠️ Admin 管理端接口：配置的增删改查
    // ==========================================

    // 获取所有咨询分身配置
    @GetMapping("/admin/configs")
    public ResponseEntity<?> getAllConfigs() {
        return ResponseEntity.ok(consultConfigRepository.findAll());
    }

    // 物理保存/更新配置
    @PostMapping("/admin/config/save")
    public ResponseEntity<?> saveConfig(@RequestBody ConsultConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        consultConfigRepository.save(config);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ==========================================
    // 🌐 客户端接口：变色龙与咨询流程
    // ==========================================

    @GetMapping("/config")
    public ResponseEntity<?> getUiConfig(@RequestParam(defaultValue = "default") String tenantId) {
        ConsultConfig config = consultConfigRepository.findByTenantId(tenantId).orElse(null);
        String title = (config != null && config.getUiPageTitle() != null && !config.getUiPageTitle().isEmpty()) ? config.getUiPageTitle() : "AI 职业规划大师";
        String welcome = (config != null && config.getUiWelcomeMsg() != null && !config.getUiWelcomeMsg().isEmpty()) ? config.getUiWelcomeMsg() : "上传简历，解锁你的专属职业路线";
        String btnText = (config != null && config.getUiBtnText() != null && !config.getUiBtnText().isEmpty()) ? config.getUiBtnText() : "🚀 开启深度职业体检";

        return ResponseEntity.ok(Map.of("uiPageTitle", title, "uiWelcomeMsg", welcome, "uiBtnText", btnText, "tenantId", tenantId));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userName") String userName,
            @RequestParam("email") String email,
            @RequestParam(value = "tenantId", defaultValue = "default") String tenantId) {
        try {
            return ResponseEntity.ok(consultService.startConsultation(file, userName, email, tenantId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> payload) {
        Long recordId = Long.valueOf(payload.get("recordId"));
        String userMsg = payload.get("message");
        String tenantId = payload.getOrDefault("tenantId", "default");

        return ResponseEntity.ok(consultService.processChat(recordId, userMsg, tenantId));
    }
}