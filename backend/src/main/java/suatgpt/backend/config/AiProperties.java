package suatgpt.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    private ConfigItem anythingLlm;
    private ConfigItem qwenInternal;
    private ConfigItem deepseekInternal;
    private ConfigItem qwenPublic;
    private ConfigItem deepseekPublic;
    private WeKnoraConfig deepseek; // 对应你配置里的第6项
    private ConfigItem aliyunCoding;
    private ConfigItem embedding;

    // --- 手动生成的 Getter 和 Setter ---
    public ConfigItem getAnythingLlm() { return anythingLlm; }
    public void setAnythingLlm(ConfigItem anythingLlm) { this.anythingLlm = anythingLlm; }

    public ConfigItem getQwenInternal() { return qwenInternal; }
    public void setQwenInternal(ConfigItem qwenInternal) { this.qwenInternal = qwenInternal; }

    public ConfigItem getDeepseekInternal() { return deepseekInternal; }
    public void setDeepseekInternal(ConfigItem deepseekInternal) { this.deepseekInternal = deepseekInternal; }

    public ConfigItem getQwenPublic() { return qwenPublic; }
    public void setQwenPublic(ConfigItem qwenPublic) { this.qwenPublic = qwenPublic; }

    public ConfigItem getDeepseekPublic() { return deepseekPublic; }
    public void setDeepseekPublic(ConfigItem deepseekPublic) { this.deepseekPublic = deepseekPublic; }

    public WeKnoraConfig getDeepseek() { return deepseek; }
    public void setDeepseek(WeKnoraConfig deepseek) { this.deepseek = deepseek; }

    public ConfigItem getAliyunCoding() { return aliyunCoding; }
    public void setAliyunCoding(ConfigItem aliyunCoding) { this.aliyunCoding = aliyunCoding; }

    public ConfigItem getEmbedding() { return embedding; }
    public void setEmbedding(ConfigItem embedding) { this.embedding = embedding; }

    // 内部类也需要手动 Getter
    public static class ConfigItem {
        private String baseUrl;
        private String apiKey;
        private String model;

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
    }

    public static class WeKnoraConfig {
        private String baseUrl;
        private String apiKey;
        private String weknoraSessionId;
        private String weknoraKbId;

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getWeknoraSessionId() { return weknoraSessionId; }
        public void setWeknoraSessionId(String weknoraSessionId) { this.weknoraSessionId = weknoraSessionId; }
        public String getWeknoraKbId() { return weknoraKbId; }
        public void setWeknoraKbId(String weknoraKbId) { this.weknoraKbId = weknoraKbId; }
    }
}