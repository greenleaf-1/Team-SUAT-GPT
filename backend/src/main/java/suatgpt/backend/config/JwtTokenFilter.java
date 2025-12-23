package suatgpt.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import suatgpt.backend.utils.JwtUtils;

import java.io.IOException;

/**
 * JWT Token 过滤器 — 依赖 UserDetailsService（接口），而不是具体的 UserService 实现类
 * 继承自 OncePerRequestFilter，确保该过滤器只在每个请求中执行一次。
 */
@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    // 负责 JWT 相关的操作，如生成、解析、验证等
    private final JwtUtils jwtUtils;
    // Spring Security 接口，用于根据用户名加载用户详情（包括权限等信息）
    private final UserDetailsService userDetailsService;

    /**
     * 构造函数，通过依赖注入获取 JwtUtils 和 UserDetailsService 实例
     * @param jwtUtils JWT工具类
     * @param userDetailsService 用户详情服务
     */
    public JwtTokenFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    /**
     * 核心过滤方法，处理每个 HTTP 请求
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 尝试从请求头中获取 Authorization 字段的值
        final String header = request.getHeader("Authorization");

        String token = null;
        String username = null;

        // 2. 检查 Authorization 头是否有效，并以 "Bearer " 开头 (JWT 标准格式)
        if (header != null && header.startsWith("Bearer ")) {
            // 提取 JWT 字符串，去除 "Bearer " (共7个字符)
            token = header.substring(7);
            try {
                // 3. 从 JWT 中提取用户名
                username = jwtUtils.extractUsername(token);
            } catch (Exception e) {
                // 记录 JWT 解析或验证失败的警告信息
                logger.warn("Invalid JWT: " + e.getMessage());
                // 如果解析失败，username 仍为 null，后续认证将跳过
            }
        }

        // 4. 检查用户名是否已成功提取 且 当前 SecurityContext 中**尚未**存在认证信息
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. 根据提取的用户名，通过 UserDetailsService 加载用户详情
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 6. 验证 JWT 的有效性 (是否过期、是否被篡改等)
            if (jwtUtils.isTokenValid(token, userDetails)) {
                
                // 7. JWT 有效，创建认证对象
                // principal (主体): userDetails, credentials (凭证): null (因为已通过 token 认证), authorities (权限): userDetails.getAuthorities()
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                                
                // 8. 设置认证对象的 Web 详情，如请求的 IP 地址、Session ID 等
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 9. 将认证对象存入 SecurityContextHolder
                // 此时，Spring Security 认为当前用户已认证通过，后续的访问控制(如 @PreAuthorize)将基于此对象
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // 10. 将请求/响应传递给过滤器链中的下一个过滤器
        filterChain.doFilter(request, response);
    }
}