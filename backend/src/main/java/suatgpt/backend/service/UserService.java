package suatgpt.backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.utils.JwtUtils;
import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public User registerUser(String username, String rawPassword) {
        String trimmedName = username.trim();
        if (userRepository.existsByUsername(trimmedName)) {
            throw new IllegalArgumentException("该账号 [ " + trimmedName + " ] 已经注册过了，请直接登录。");
        }

        User newUser = new User();
        newUser.setUsername(trimmedName);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setLastHeartbeat(LocalDateTime.now());

        // 🚀 全新物理身份判定金字塔算法
        String lowerName = trimmedName.toLowerCase();

        // 规则 1：系统唯一真神
        if ("superboss".equals(lowerName)) {
            newUser.setRole("SUPERADMIN");
        }
        // 规则 2：业务管理者（包含 admin 字符，或者是中文真实姓名）
        // 解释：.*[\u4e00-\u9fa5]+.* 是匹配任意中文字符的正则表达式
        else if (lowerName.contains("admin") || trimmedName.matches(".*[\\u4e00-\\u9fa5]+.*")) {
            newUser.setRole("ADMIN");
        }
        // 规则 3：芸芸众生（非中文且不带 admin 的普通英文/数字账号）
        else {
            newUser.setRole("CANDIDATE");
        }

        System.out.println("🆕 [用户注册] 账号: " + trimmedName + " -> 物理权限分配: " + newUser.getRole());
        return userRepository.save(newUser);
    }

    @Transactional
    public String loginAndGenerateToken(String username, String password) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("账号尚未注册，请先完成第一次注册。");
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        userRepository.findByUsername(username).ifPresent(u -> {
            u.setLastHeartbeat(LocalDateTime.now());
            userRepository.save(u);
        });

        return jwtUtils.generateToken((UserDetails) auth.getPrincipal());
    }
}