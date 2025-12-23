package suatgpt.backend.service;

import org.springframework.context.annotation.Lazy; // 尽管本类中未直接使用，但保留以防 future-proofing
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException; // 尽管未直接抛出，但保留以防 future-proofing
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.utils.JwtUtils;

/**
 * 用户服务类
 * 负责处理用户注册、登录认证和 JWT token 生成的业务逻辑。
 */
@Service
public class UserService {

    // 注入用户数据访问接口
    private final UserRepository userRepository;
    // 注入密码编码器，用于加密和验证密码
    private final PasswordEncoder passwordEncoder;
    // 注入认证管理器，用于委托 Spring Security 处理用户名/密码认证
    private final AuthenticationManager authenticationManager;
    // 注入 JWT 工具类，用于生成 token
    private final JwtUtils jwtUtils;

    /**
     * 构造函数：通过依赖注入获取所有必要的组件。
     */
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    /**
     * 注册新用户
     * @param username 用户名
     * @param rawPassword 用户的明文密码
     * @return 新创建的用户实体
     * @throws IllegalArgumentException 如果用户名已存在
     */
    public User registerUser(String username, String rawPassword) {
        // 1. 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        // 2. 创建新用户实体
        User newUser = new User();
        newUser.setUsername(username);

        // 3. 对原始密码进行加密并设置到用户实体中
        newUser.setPassword(passwordEncoder.encode(rawPassword));

        // 4. 保存用户到数据库
        return userRepository.save(newUser);
    }

    /**
     * 用户登录并生成 JWT token
     * @param username 用户名
     * @param password 用户的明文密码
     * @return 生成的 JWT token 字符串
     * @throws AuthenticationException (通过 AuthenticationManager 抛出) 如果认证失败
     */
    public String loginAndGenerateToken(String username, String password) {
        // 1. 使用 AuthenticationManager 进行认证
        // 这将触发 SecurityUserDetailsService 来加载用户，并使用 PasswordEncoder 验证密码
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        // 2. 认证成功后，从 Authentication 对象中获取 UserDetails (已认证的用户主体)
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // 3. 使用 UserDetails 信息生成 JWT Token
        return jwtUtils.generateToken(userDetails);
    }
}