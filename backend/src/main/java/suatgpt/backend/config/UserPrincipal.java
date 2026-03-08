package suatgpt.backend.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;

/**
 * David 老师，这是当前登录用户的物理镜像
 */
public class UserPrincipal implements UserDetails {
    private Long id; // 🚀 关键：有了它，才能“各看各的”
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    // 🚀 手写构造函数
    public UserPrincipal(Long id, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    // 🚀 手写 Getter (解决 Cannot resolve method 'getId' 报错)
    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() { return username; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}