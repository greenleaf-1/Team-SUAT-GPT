
package suatgpt.backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.UserRepository;
import suatgpt.backend.utils.JwtUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public User registerUser(String username, String rawPassword) {
        // 校验前缀：SUAT/XJY/XMU
        String upperName = username.toUpperCase();
        if (!(upperName.startsWith("SUAT") || upperName.startsWith("XJY") || upperName.startsWith("XMU"))) {
            throw new IllegalArgumentException("用户名必须以 SUAT、XJY 或 XMU 开头");
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("该用户名已存在");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(newUser);
    }

    public String loginAndGenerateToken(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return jwtUtils.generateToken(userDetails);
    }
}
