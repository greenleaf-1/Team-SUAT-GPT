package suatgpt.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    // 对应 YAML 中的 ai.deepseek-public
    private DeepSeekPublic deepseekPublic;

    public DeepSeekPublic getDeepseekPublic() {
        return deepseekPublic;
    }

    public void setDeepseekPublic(DeepSeekPublic deepseekPublic) {
        this.deepseekPublic = deepseekPublic;
    }

    // 内部静态类，对应 deepseek-public 下的字段
    public static class DeepSeekPublic {
        private String baseUrl;
        private String apiKey;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }
    }
}