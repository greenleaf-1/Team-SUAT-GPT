package suatgpt.backend.config;

import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final JwtTokenFilter jwtTokenFilter;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;
    @Value("${cors.allowed-methods}")
    private String allowedMethods;
    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    public WebSecurityConfig(@Lazy JwtTokenFilter jwtTokenFilter) {
        this.jwtTokenFilter = jwtTokenFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));
        config.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        config.setExposedHeaders(Collections.singletonList("Authorization"));
        config.setMaxAge(3600L);
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. 禁用 CSRF（前后端分离架构的物理标配）
                .csrf(AbstractHttpConfigurer::disable)

                // 2. 配置跨域（直接复用你的配置）
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
                    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(Collections.singletonList("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                // 3. 核心：合并后的请求授权规则（已插入招聘与面试白名单）
                .authorizeHttpRequests(auth -> auth
                        // A. 内部类型放行
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()

                        // B. 招聘与面试接口白名单（新增 /api/recruit/** 物理通行证）
                        .requestMatchers("/api/recruit/upload").permitAll()
                        .requestMatchers("/api/recruit/chat").permitAll() // ✅ 物理新增：放行面试对话
                        .requestMatchers("/api/recruit/admin/**").permitAll() // ✅ 物理新增：放行部长发布公告

                        // C. 其他原有白名单（一行未删）
                        .requestMatchers("/api/auth/**", "/h2-console/**", "/error").permitAll()
                        .requestMatchers("/api/course/**", "/api/ai/**").permitAll()

                        // D. 终点站：剩下的全都要鉴权
                        .anyRequest().authenticated()
                )

                // 4. 无状态会话管理
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. 加入你的 JWT 物理过滤器
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        // 6. 禁用 X-Frame-Options（方便 H2 控制台显示）
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}