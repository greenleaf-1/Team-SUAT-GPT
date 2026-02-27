package suatgpt.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.service.UserService;
import suatgpt.backend.utils.JwtUtils;

import java.util.Map;

/**
 * 认证控制器
 * 物理修复版：支持登录即自动注册，并根据用户名特征区分 ADMIN 和 CANDIDATE 角色。
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;

    /**
     * 构造函数：注入所有核心安全组件，解决符号找不到的问题。
     */
    public AuthController(UserService userService,
                          UserRepository userRepository,
                          AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtUtils jwtUtils) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtils = jwtUtils;
    }

    // --- DTOs (使用 Class 替代 Record 以确保物理 Getter 存在) ---

    public static class AuthRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String message;

        public AuthResponse(String token, String message) {
            this.token = token;
            this.message = message;
        }

        public String getToken() { return token; }
        public String getMessage() { return message; }
    }

    // --- API Endpoints ---

    /**
     * 用户登录接口 (逻辑增强版)
     * 实现：不存在即自动注册，通过前缀和关键字判定角色。
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();

        try {
            // 1. 物理检查：如果数据库中不存在该用户，则先执行注册逻辑。
            if (!userRepository.existsByUsername(username)) {
                System.out.println(">>> [自动注册] 检测到新用户: " + username);
                // UserService.registerUser 内部已包含 ADMIN 关键字判定和前缀校验逻辑。
                userService.registerUser(username, password);
            }

            // 2. 此时数据库已有记录，进行标准 Spring Security 认证。
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // 3. 认证成功，生成 JWT Token 并更新心跳。
            final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            final String token = jwtUtils.generateToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "message", "Authentication successful"
            ));

        } catch (IllegalArgumentException e) {
            // 捕获 SUAT/XJY/XMU 前缀校验失败。
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (AuthenticationException e) {
            // 捕获密码错误。
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "System error: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户信息
     * 路由: GET /api/auth/me。
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, "Not authenticated"));
        }

        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new AuthResponse(null, "User not found"));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "status", user.getStatus()
        ));
    }
}