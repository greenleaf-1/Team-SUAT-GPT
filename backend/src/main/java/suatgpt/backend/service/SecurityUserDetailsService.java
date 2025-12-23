package suatgpt.backend.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.UserRepository;

/**
 * 安全用户详情服务
 * 实现 Spring Security 的 UserDetailsService 接口，用于从数据库加载用户认证信息。
 * 它是 Spring Security 认证提供者 (AuthenticationProvider) 的核心依赖。
 */
@Service
public class SecurityUserDetailsService implements UserDetailsService {

    // 注入用户数据访问接口
    private final UserRepository userRepository;

    /**
     * 构造函数：通过依赖注入获取 UserRepository 实例。
     */
    public SecurityUserDetailsService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    /**
     * 实现 UserDetailsService 接口中的核心方法。
     * Spring Security 在认证过程中会调用此方法，根据用户名加载用户详情。
     *
     * @param username 用户尝试登录时提供的用户名
     * @return 包含用户认证和授权信息的 UserDetails 对象
     * @throws UsernameNotFoundException 如果数据库中找不到对应的用户
     */
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // 1. 通过 UserRepository 根据用户名查询数据库中的 User 实体
        User user = userRepository.findByUsername(username)
                // 如果用户不存在，抛出 UsernameNotFoundException，这是 Spring Security 认证失败的标准异常
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // 2. 将自定义的 User 实体转换为 Spring Security 要求的 UserDetails 对象
        // 使用 Spring Security 提供的 User.builder() 来创建 UserDetails 实例
        return org.springframework.security.core.userdetails.User
                .builder()
                // 设置用户名
                .username(user.getUsername())
                // 设置加密后的密码。Spring Security 会使用 PasswordEncoder 与用户输入的密码进行比较。
                .password(user.getPassword())
                // 设置用户角色/权限。如果 user.getRole() 返回 "USER"，则权限为 "ROLE_USER"。
                .roles(user.getRole())
                // 构建最终的 UserDetails 对象
                .build();
    }
}