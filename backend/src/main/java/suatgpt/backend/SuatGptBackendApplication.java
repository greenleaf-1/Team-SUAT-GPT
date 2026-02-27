
package suatgpt.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.UserRepository;

@SpringBootApplication
@EnableScheduling // 🚀 必须开启这个，定时任务才会物理生效！
public class SuatGptBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SuatGptBackendApplication.class, args);
        System.out.println("\n--- SUAT GPT Backend Started ---");
        System.out.println("Default Login: admin / 123456");
        System.out.println("--------------------------------\n");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * 自动初始化测试账号
     */
    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println(">>> Created default user: admin / 123456");
            }
        };
    }
}
