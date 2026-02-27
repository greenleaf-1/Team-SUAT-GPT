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
        String upperName = username.toUpperCase();
        // 原有 SUAT/XJY/XMU 逻辑
        if (!(upperName.startsWith("SUAT") || upperName.startsWith("XJY") || upperName.startsWith("XMU"))) {
            throw new IllegalArgumentException("用户名必须以 SUAT、XJY 或 XMU 开头");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("该用户名已存在");
        }
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        // 自动分发部长角色
        newUser.setRole(upperName.contains("ADMIN") ? "ADMIN" : "CANDIDATE");
        newUser.setLastHeartbeat(LocalDateTime.now());
        return userRepository.save(newUser);
    }

    @Transactional
    public String loginAndGenerateToken(String username, String password) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        // 🚀 核心：登录即更新心跳
        userRepository.findByUsername(username).ifPresent(u -> {
            u.setLastHeartbeat(LocalDateTime.now());
            userRepository.save(u);
        });
        return jwtUtils.generateToken((UserDetails) auth.getPrincipal());
    }
}