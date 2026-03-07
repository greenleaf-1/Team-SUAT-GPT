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

        String upperName = trimmedName.toUpperCase();
        User newUser = new User();
        newUser.setUsername(trimmedName);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setLastHeartbeat(LocalDateTime.now());

        // 🚀 物理身份判定算法：支持学生、导师与管理
        boolean isStudent = upperName.startsWith("SUAT") ||
                upperName.startsWith("XJY") ||
                upperName.startsWith("XMU");

        // 💡 权限调整策略：
        if (upperName.contains("ADMIN")) {
            newUser.setRole("ADMIN");
        } else if (isStudent) {
            newUser.setRole("CANDIDATE");
        } else {
            // 🚀 物理提权：将所有导师（非学生账号）直接设定为 ADMIN，
            // 这样他们在首页就能点亮所有系统模块了。
            newUser.setRole("ADMIN");
        }

        System.out.println("🆕 [物理提权注册] 用户: " + trimmedName + " -> 最终权限: " + newUser.getRole());
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