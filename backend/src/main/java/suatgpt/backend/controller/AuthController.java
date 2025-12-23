package suatgpt.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suatgpt.backend.service.UserService;
import suatgpt.backend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import suatgpt.backend.model.User;

/**
 * 认证控制器
 * 负责处理用户认证相关的 API 路由，包括注册和登录。
 * @RestController: 组合了 @Controller 和 @ResponseBody。
 * @RequestMapping("/api/auth"): 定义所有方法的基本路由路径。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 注入用户服务和用户仓库，用于处理注册/登录和查询当前用户
    private final UserService userService;
    private final UserRepository userRepository;

    /**
     * 构造函数：通过依赖注入获取 UserService 和 UserRepository 实例。
     */
    public AuthController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // --- DTOs (Data Transfer Objects) ---

    /**
     * 登录/注册请求体 (DTO)
     * 用于接收客户端提交的用户名和密码。
     * @param username 用户名
     * @param password 密码
     */
    record AuthRequest(String username, String password) {}

    /**
     * 认证成功响应体 (DTO)
     * 用于向客户端返回 JWT Token 和一条消息。
     * @param token JWT 令牌（登录时返回）
     * @param message 响应消息
     */
    record AuthResponse(String token, String message) {}

    // --- API Endpoints ---

    /**
     * 用户注册接口
     * 路由: POST /api/auth/register
     * @param request 包含用户名和密码的 AuthRequest DTO
     * @return 注册成功信息或错误详情
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        try {
            // 调用服务层进行用户注册
            userService.registerUser(request.username, request.password);
            // 注册成功，返回 200 OK
            return ResponseEntity.ok(new AuthResponse(null, "User registered successfully!"));
        } catch (IllegalArgumentException e) {
            // 捕获业务逻辑异常（如用户名已存在），返回 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(null, e.getMessage()));
        } catch (Exception e) {
            // 捕获其它服务器端异常，返回 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new AuthResponse(null, "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * 用户登录接口
     * 路由: POST /api/auth/login
     * @param request 包含用户名和密码的 AuthRequest DTO
     * @return 包含 JWT Token 的响应或认证失败信息
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // 调用服务层进行登录验证并生成 JWT Token
            String token = userService.loginAndGenerateToken(request.username, request.password);
            // 登录成功，返回 200 OK，携带生成的 token
            return ResponseEntity.ok(new AuthResponse(token, "Authentication successful"));
        } catch (Exception e) {
            // 捕获认证失败异常（如用户名不存在或密码错误），返回 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, "Invalid username or password"));
        }
    }

    /**
     * 获取当前已认证用户的信息（脱敏，不包含密码）
     * 路由: GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, "Not authenticated"));
        }

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new AuthResponse(null, "User not found"));
        }

        // 返回脱敏后的用户信息
        var userDto = new Object() {
            public Long id = user.getId();
            public String username = user.getUsername();
            public String role = user.getRole();
        };

        return ResponseEntity.ok(userDto);
    }
}