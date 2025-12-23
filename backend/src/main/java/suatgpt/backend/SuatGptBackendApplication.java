package suatgpt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * SUAT GPT 后端应用启动文件
 * @SpringBootApplication: 这是一个方便的注解，它结合了 @Configuration, @EnableAutoConfiguration, 和 @ComponentScan 三个注解。
 * 它是 Spring Boot 应用程序的入口点。
 */
@SpringBootApplication
public class SuatGptBackendApplication {

    public static void main(String[] args) {
        // 启动 Spring Boot 应用程序
        SpringApplication.run(SuatGptBackendApplication.class, args);
        
        // 应用程序启动成功后的控制台输出信息
        System.out.println("\n--- SUAT GPT Backend Application Started ---");
        // 提示开发者模式下的 H2 数据库控制台访问信息
        System.out.println("Access H2 Console (Dev Only): http://localhost:8080/h2-console");
        System.out.println("   JDBC URL: jdbc:h2:mem:suatdb");
        System.out.println("   User: sa, Password: password");
        System.out.println("------------------------------------------\n");
    }
@Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}