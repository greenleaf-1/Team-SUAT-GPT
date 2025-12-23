package suatgpt.backend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT 工具类
 * 负责 JWT Token 的生成、解析和验证。
 * 需要在 application.properties/yml 中配置 jwt.secret 属性。
 * @Component: 声明该类为 Spring 管理的组件。
 */
@Component
public class JwtUtils {

    // 从配置文件中读取 JWT 密钥 (Base64 编码的字符串)
    @Value("${jwt.secret}")
    private String secret;

    // JWT Token 有效期 (毫秒)，这里设置为 24 小时 (1000 * 60 * 60 * 24)
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    // --- Token Generation (Token 生成) ---

    /**
     * 生成 JWT Token 的入口方法
     * @param userDetails 用户详情，通常用于获取用户名作为 Token 的 Subject
     * @return JWT Token 字符串
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // 可以在 claims 中添加用户的角色等自定义信息，这里暂为空
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * 根据声明 (claims) 和主题 (subject) 创建 Token
     * @param claims 附加信息
     * @param subject Token 的主题，通常是用户名
     * @return 完整的 JWT Token 字符串
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // 设置主题（Subject，即用户名）
                .setIssuedAt(new Date(System.currentTimeMillis())) // 签发时间 (Issued At)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 过期时间 (Expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 使用 HS256 算法和密钥进行签名
                .compact(); // 压缩并生成 Token 字符串
    }

    // --- Token Validation & Extraction (Token 验证与提取) ---

    /**
     * 从 Token 中提取用户名 (即 Subject)
     * @param token JWT Token 字符串
     * @return 用户名
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * 检查 Token 是否有效
     * 验证用户名是否匹配，并检查 Token 是否过期。
     * @param token JWT Token 字符串
     * @param userDetails 用户的详细信息
     * @return Token 是否有效
     */
    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * 检查 Token 是否过期
     * @param token JWT Token 字符串
     * @return Token 是否已过期
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * 从 Token 中提取过期时间 (Expiration Date)
     * @param token JWT Token 字符串
     * @return 过期时间 Date 对象
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 从 Token 中提取特定声明 (Claim) 的通用方法
     * @param token JWT Token 字符串
     * @param claimsResolver 用于从 Claims 中解析所需值的函数
     * @param <T> 声明值的类型
     * @return 提取出的声明值
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 解析并获取 Token 中的所有声明 (Claims)
     * @param token JWT Token 字符串
     * @return 包含所有声明的 Claims 对象
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // 设置签名密钥
                .build()
                .parseClaimsJws(token) // 解析 Token
                .getBody(); // 获取声明主体
    }

    // --- Private Helper (私有辅助方法) ---

    /**
     * 获取签名密钥
     * 将配置的 Base64 编码的密钥解码为 Key 对象。
     * @return 用于签名的 Key 对象
     */
    private Key getSigningKey() {
        // 对 Base64 编码的密钥字符串进行解码
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        // 使用解码后的字节创建 HMAC-SHA Key
        return Keys.hmacShaKeyFor(keyBytes);
    }
}