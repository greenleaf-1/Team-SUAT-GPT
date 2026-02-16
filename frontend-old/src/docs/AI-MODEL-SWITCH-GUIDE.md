# AI 模型切换功能 - 完整实现指南

## 📋 目录
1. [功能概述](#功能概述)
2. [前端实现](#前端实现)
3. [API接口规范](#api接口规范)
4. [使用说明](#使用说明)
5. [后端对接清单](#后端对接清单)

---

## 🎯 功能概述

### 目标
为聊天界面添加AI模型切换功能，解决公网用户无法访问内网AI的问题。

### 核心特性
- ✅ 支持两种模型切换：内网模型（默认）和公网模型
- ✅ 所有请求自动携带JWT Token
- ✅ 模型选择状态实时保存
- ✅ 友好的UI/UX设计

---

## 🎨 前端实现

### 1. 文件结构

```
/api/chat.ts              # 聊天API封装（新建）
/components/AIChat.tsx    # 聊天组件（已更新）
/utils/api-config.ts      # API配置（已更新）
```

### 2. 核心代码

#### `/api/chat.ts` - API封装

```typescript
import { API_CONFIG, buildUrl, API_ENDPOINTS } from '../utils/api-config';

export type ModelKey = 'qwen-internal' | 'qwen-public';

export interface ChatRequest {
  content: string;
  modelKey: ModelKey;
}

export async function sendChatMessage(
  content: string,
  modelKey: ModelKey
): Promise<ChatResponse> {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('未找到认证令牌，请先登录');
  }

  const response = await fetch(buildUrl(API_ENDPOINTS.AI.CHAT), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      modelKey,
    }),
  });

  // ... 错误处理
  return await response.json();
}
```

#### `/components/AIChat.tsx` - 组件更新

```typescript
export function AIChat() {
  // 🔑 核心状态：用户选择的模型键
  const [selectedModel, setSelectedModel] = useState<ModelKey>('qwen-internal');

  const handleSend = async () => {
    // ... 用户消息处理
    
    // 调用后端API - 传递内容和模型键
    const response = await sendChatMessage(inputValue, selectedModel);
    
    // ... 处理响应
  };

  return (
    <div>
      {/* 模型选择器UI */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setSelectedModel('qwen-internal')}>
          🏫 Qwen (内网)
        </button>
        <button onClick={() => setSelectedModel('qwen-public')}>
          🌐 Qwen (公网)
        </button>
      </div>
      
      {/* 聊天界面 */}
      {/* ... */}
    </div>
  );
}
```

---

## 🔌 API接口规范

### 后端接口：POST `/api/ai/chat`

#### 请求头 (Headers)
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### 请求体 (Request Body)
```json
{
  "content": "用户输入的聊天消息",
  "modelKey": "qwen-internal"
}
```

#### 模型键值 (Model Keys)

| 模型名称 | modelKey 值 | 说明 |
|---------|------------|------|
| Qwen (内网) | `qwen-internal` | 默认选项，校园网环境使用 |
| Qwen (公网) | `qwen-public` | 新增选项，公网环境使用 |

#### 响应体 (Response Body)
```json
{
  "success": true,
  "content": "AI的回复内容",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

---

## 💡 使用说明

### 前端开发者

1. **导入API函数**
   ```typescript
   import { sendChatMessage, ModelKey } from '../api/chat';
   ```

2. **管理模型选择状态**
   ```typescript
   const [selectedModel, setSelectedModel] = useState<ModelKey>('qwen-internal');
   ```

3. **发送聊天请求**
   ```typescript
   const response = await sendChatMessage(userInput, selectedModel);
   ```

### 用户操作流程

1. 打开聊天界面
2. 在顶部选择AI模型：
   - 🏫 **Qwen (内网)** - 校园网使用，速度快
   - 🌐 **Qwen (公网)** - 公网使用，随时随地
3. 输入消息并发送
4. 系统自动使用选中的模型处理请求

---

## ✅ 后端对接清单

### Java Spring Boot 实现要点

#### 1. Controller 接口
```java
@RestController
@RequestMapping("/api/ai")
public class AIChatController {
    
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
        @RequestHeader("Authorization") String token,
        @RequestBody ChatRequest request
    ) {
        // 1. 验证JWT Token
        String jwt = token.replace("Bearer ", "");
        User user = jwtService.validateToken(jwt);
        
        // 2. 获取请求参数
        String content = request.getContent();
        String modelKey = request.getModelKey(); // "qwen-internal" 或 "qwen-public"
        
        // 3. 根据modelKey路由到不同的AI服务
        String aiResponse;
        if ("qwen-internal".equals(modelKey)) {
            aiResponse = internalAIService.chat(content);
        } else if ("qwen-public".equals(modelKey)) {
            aiResponse = publicAIService.chat(content);
        } else {
            throw new IllegalArgumentException("Invalid model key");
        }
        
        // 4. 返回响应
        return ResponseEntity.ok(new ChatResponse(true, aiResponse));
    }
}
```

#### 2. DTO 类
```java
// 请求DTO
public class ChatRequest {
    private String content;
    private String modelKey; // "qwen-internal" | "qwen-public"
    
    // getters & setters
}

// 响应DTO
public class ChatResponse {
    private boolean success;
    private String content;
    private String timestamp;
    
    // getters & setters
}
```

#### 3. JWT验证Filter
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // 验证JWT Token
                Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
                
                // 设置用户认证信息
                // ...
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 必须实现的功能

- ✅ JWT Token验证
- ✅ 接收 `content` 和 `modelKey` 参数
- ✅ 根据 `modelKey` 路由到不同AI服务
- ✅ 返回标准格式的JSON响应
- ✅ 错误处理和友好的错误消息

---

## 🔧 调试指南

### 前端调试

1. **检查JWT Token**
   ```javascript
   console.log('Token:', localStorage.getItem('authToken'));
   ```

2. **查看请求日志**
   - 浏览器开发者工具 → Network → XHR
   - 查看 `/api/ai/chat` 请求
   - 检查 Headers 和 Payload

3. **API调用日志**
   - 所有关键步骤都有 `console.log` 输出
   - 🚀 表示开始请求
   - ✅ 表示成功
   - ❌ 表示失败

### 后端调试

1. **启用请求日志**
   ```java
   @Slf4j
   public class AIChatController {
       @PostMapping("/chat")
       public ResponseEntity<ChatResponse> chat(...) {
           log.info("收到聊天请求: content={}, modelKey={}", 
                    request.getContent(), request.getModelKey());
           // ...
       }
   }
   ```

2. **验证JWT**
   ```java
   log.info("JWT Token: {}", token);
   log.info("解析后的用户: {}", user.getUsername());
   ```

---

## 📝 测试清单

### 功能测试
- [ ] 用户未登录时，显示"请先登录"提示
- [ ] 用户登录后，能正常发送消息
- [ ] 切换到"内网模型"，消息发送成功
- [ ] 切换到"公网模型"，消息发送成功
- [ ] AI响应正确显示在聊天界面
- [ ] 思考状态（Loading）正常显示

### 安全测试
- [ ] 无Token请求被拒绝（401）
- [ ] 无效Token请求被拒绝（401）
- [ ] 过期Token请求被拒绝（401）

### 边界测试
- [ ] 空消息无法发送
- [ ] 超长消息正常处理
- [ ] 网络错误时显示友好提示
- [ ] AI服务异常时显示错误信息

---

## 🚀 部署注意事项

1. **后端URL配置**
   - 开发环境：`http://localhost:8080/api`
   - 生产环境：更新 `/utils/api-config.ts` 中的 `BASE_URL`

2. **CORS配置**
   - 后端必须允许前端域名的跨域请求
   ```java
   @Configuration
   public class CorsConfig {
       @Bean
       public WebMvcConfigurer corsConfigurer() {
           return new WebMvcConfigurer() {
               @Override
               public void addCorsMappings(CorsRegistry registry) {
                   registry.addMapping("/api/**")
                           .allowedOrigins("http://your-frontend-domain.com")
                           .allowedMethods("GET", "POST", "PUT", "DELETE")
                           .allowedHeaders("*")
                           .allowCredentials(true);
               }
           };
       }
   }
   ```

3. **Mock数据开关**
   - 开发阶段：`USE_MOCK_DATA: true`
   - 对接后端后：`USE_MOCK_DATA: false`

---

## 📞 常见问题

**Q: 为什么会显示"未找到认证令牌"？**
A: 用户未登录或Token已过期，需要重新登录。

**Q: 如何添加更多模型选项？**
A: 在 `/api/chat.ts` 中更新 `ModelKey` 类型和 `MODEL_CONFIGS`，然后在组件中添加对应的UI。

**Q: 后端如何知道使用哪个AI服务？**
A: 前端发送的 `modelKey` 参数告诉后端选择哪个AI服务，后端根据这个参数路由请求。

---

## 📚 相关文档

- [后端API接口文档](./BACKEND-API-SPEC.md)
- [JWT认证实现指南](./JWT-AUTH-GUIDE.md)
- [前端架构说明](./FRONTEND-ARCHITECTURE.md)

---

**最后更新**: 2024-12-03
**维护者**: SUAT-GPT 开发团队
