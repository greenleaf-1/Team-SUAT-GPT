# ✅ AI模型切换功能 - 验收清单

## 📋 快速验收清单（5分钟）

### 第一步：检查文件 (1分钟)

```bash
# 必须存在这些文件
✅ /api/chat.ts                      # AI API封装
✅ /components/AIChat.tsx            # 聊天组件（已更新）
✅ /utils/api-config.ts              # API配置（已更新）
✅ /docs/AI-MODEL-SWITCH-GUIDE.md   # 完整指南
✅ /docs/AI-QUICK-TEST.md           # 测试指南
✅ /docs/API-FLOW-DIAGRAM.md        # 流程图
✅ /AI_MODEL_SWITCH_COMPLETE.md     # 完成报告
```

### 第二步：启动应用 (1分钟)

```bash
npm run dev
# 访问 http://localhost:5173
```

### 第三步：UI验证 (1分钟)

```
1. 进入AI聊天界面
   ✅ 看到模型选择器区域（紫色渐变背景）
   
2. 检查模型选择器
   ✅ 有两个大按钮
   ✅ 左侧：🏫 Qwen (内网) - 默认紫色高亮
   ✅ 右侧：🌐 Qwen (公网) - 白色背景
   
3. 测试切换
   ✅ 点击"Qwen (公网)"
   ✅ 按钮变成紫色
   ✅ 底部显示"当前使用: 🌐 Qwen (公网)"
   
4. 快速功能区
   ✅ 下方有4个快捷按钮
   ✅ 点击可自动填充到输入框
```

### 第四步：功能测试 (2分钟)

```
1. 检查JWT Token
   - 打开浏览器控制台 (F12)
   - 执行: localStorage.getItem('authToken')
   ✅ 应该看到token字符串（如果已登录）
   
2. 发送测试消息
   - 输入："你好"
   - 点击发送
   ✅ 控制台显示: 🚀 调用后端API
   ✅ Network标签看到: POST /api/ai/chat
   
3. 检查请求（Network标签）
   Request Headers:
   ✅ Authorization: Bearer <token>
   ✅ Content-Type: application/json
   
   Request Payload:
   ✅ content: "你好"
   ✅ modelKey: "qwen-internal"
   
4. 切换模型测试
   - 点击"Qwen (公网)"
   - 发送消息："测试公网"
   ✅ modelKey 变为 "qwen-public"
```

---

## 🎯 核心功能验收

### ✅ 必须通过的检查项

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | UI正常显示 | ✅ | 模型选择器美观清晰 |
| 2 | 默认选中内网 | ✅ | qwen-internal 默认紫色高亮 |
| 3 | 可以切换模型 | ✅ | 点击按钮即时切换 |
| 4 | 选中状态正确 | ✅ | 视觉反馈明确 |
| 5 | Token自动携带 | ✅ | Authorization header存在 |
| 6 | 参数正确传递 | ✅ | content和modelKey都在body中 |
| 7 | 错误处理完善 | ✅ | Token缺失时友好提示 |
| 8 | 代码质量高 | ✅ | 类型安全、注释清晰 |
| 9 | 文档完整 | ✅ | 4份文档覆盖所有场景 |

---

## 🔌 后端对接清单

### 后端需要实现 (按优先级)

#### 🔴 P0 - 核心功能（必须）

```java
1. ✅ POST /api/ai/chat 接口
   - 接收: { content, modelKey }
   - 返回: { success, content, timestamp }

2. ✅ JWT Token验证
   - 验证Authorization header
   - 提取用户信息

3. ✅ 模型路由
   - if (modelKey == "qwen-internal") → 内网AI
   - if (modelKey == "qwen-public") → 公网AI

4. ✅ CORS配置
   - 允许前端域名访问
   - 允许POST方法
   - 允许Authorization header
```

#### 🟡 P1 - 增强功能（重要）

```java
1. ⏳ GET /api/ai/chat/history
   - 返回聊天历史记录

2. ⏳ 错误状态码
   - 401: Token无效
   - 403: 无权限
   - 500: 服务器错误

3. ⏳ 日志记录
   - 记录每次AI调用
   - 记录Token验证失败
```

#### 🟢 P2 - 优化功能（可选）

```java
1. ⏳ DELETE /api/ai/chat/history
   - 清除聊天历史

2. ⏳ AI响应缓存
   - 相同问题返回缓存

3. ⏳ 异步处理
   - AI调用使用异步避免阻塞
```

---

## 📝 后端最小可运行代码

### Controller (测试用)

```java
@RestController
@RequestMapping("/api/ai")
@Slf4j
public class AIChatController {
    
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, String> request
    ) {
        // 1. 验证Token（简化版）
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "未授权"));
        }
        
        // 2. 获取参数
        String content = request.get("content");
        String modelKey = request.get("modelKey");
        
        log.info("收到聊天请求: content={}, modelKey={}", content, modelKey);
        
        // 3. 模拟AI响应（测试用）
        String aiResponse = "这是来自" + 
            ("qwen-internal".equals(modelKey) ? "内网" : "公网") + 
            "模型的回复：" + content;
        
        // 4. 返回响应
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("content", aiResponse);
        response.put("timestamp", new Date().toString());
        
        return ResponseEntity.ok(response);
    }
}
```

### CORS配置

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## 🧪 完整测试流程

### 测试场景1：内网模型测试

```
1. 启动后端 (Java Spring Boot on :8080)
2. 启动前端 (React on :5173)
3. 登录系统获取Token
4. 进入AI聊天界面
5. 确认选中"Qwen (内网)"（默认）
6. 输入："介绍一下Java"
7. 发送

期望结果:
✅ 请求发送到 POST http://localhost:8080/api/ai/chat
✅ Header包含 Authorization: Bearer <token>
✅ Body包含 {"content": "介绍一下Java", "modelKey": "qwen-internal"}
✅ 后端日志显示收到请求
✅ 前端显示AI回复
```

### 测试场景2：公网模型测试

```
1. 点击"Qwen (公网)"按钮
2. 按钮变成紫色高亮
3. 输入："什么是Spring Boot"
4. 发送

期望结果:
✅ modelKey 变为 "qwen-public"
✅ 后端调用公网AI服务
✅ 前端显示回复
```

### 测试场景3：Token缺失测试

```
1. 打开控制台
2. 执行: localStorage.removeItem('authToken')
3. 尝试发送消息

期望结果:
✅ 前端显示："未找到认证令牌，请先登录"
✅ 不发送HTTP请求
```

### 测试场景4：网络错误测试

```
1. 关闭后端服务
2. 发送消息

期望结果:
✅ 显示友好错误提示
✅ 包含解决建议
✅ 不影响界面其他功能
```

---

## 📊 API请求示例库

### 示例1：成功请求（内网）

**Request:**
```http
POST http://localhost:8080/api/ai/chat HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "content": "什么是Java多态？",
  "modelKey": "qwen-internal"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "content": "Java多态是面向对象编程的三大特性之一...",
  "timestamp": "2024-12-03T10:30:00Z"
}
```

### 示例2：成功请求（公网）

**Request:**
```http
POST http://localhost:8080/api/ai/chat HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "content": "介绍Spring Boot框架",
  "modelKey": "qwen-public"
}
```

**Response:**
```http
HTTP/1.1 200 OK

{
  "success": true,
  "content": "Spring Boot是一个开源的Java框架...",
  "timestamp": "2024-12-03T10:31:00Z"
}
```

### 示例3：Token缺失

**Request:**
```http
POST http://localhost:8080/api/ai/chat HTTP/1.1
Content-Type: application/json

{
  "content": "测试消息",
  "modelKey": "qwen-internal"
}
```

**Response:**
```http
HTTP/1.1 401 Unauthorized

{
  "success": false,
  "message": "未授权，缺少认证令牌"
}
```

---

## 🎓 知识点总结

### 前端关键技术

1. **TypeScript类型系统**
   ```typescript
   export type ModelKey = 'qwen-internal' | 'qwen-public';
   ```

2. **React Hooks状态管理**
   ```typescript
   const [selectedModel, setSelectedModel] = useState<ModelKey>('qwen-internal');
   ```

3. **Fetch API + JWT**
   ```typescript
   fetch(url, {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   ```

4. **错误边界处理**
   ```typescript
   try {
     await sendChatMessage(...);
   } catch (error) {
     // 友好错误提示
   }
   ```

### 后端关键技术

1. **Spring MVC REST**
   ```java
   @PostMapping("/chat")
   public ResponseEntity<ChatResponse> chat(...)
   ```

2. **JWT验证**
   ```java
   String jwt = token.replace("Bearer ", "");
   User user = jwtService.validateToken(jwt);
   ```

3. **条件路由**
   ```java
   if ("qwen-internal".equals(modelKey)) {
     // 内网AI
   } else {
     // 公网AI
   }
   ```

4. **CORS配置**
   ```java
   registry.addMapping("/api/**")
     .allowedOrigins("http://localhost:5173")
   ```

---

## 📞 问题排查手册

### 问题1: "未找到认证令牌"

**原因**: localStorage中没有authToken

**解决**:
```javascript
// 1. 检查Token
console.log(localStorage.getItem('authToken'));

// 2. 如果为null，先登录
// 3. 测试用：手动设置
localStorage.setItem('authToken', 'test-token-123');
```

### 问题2: CORS错误

**错误信息**: 
```
Access to fetch at 'http://localhost:8080/api/ai/chat' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**解决**: 后端添加CORS配置（见上方代码）

### 问题3: 404 Not Found

**原因**: 后端路由不存在或URL配置错误

**解决**:
```typescript
// 检查 /utils/api-config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api', // 确认地址正确
};
```

### 问题4: 401 Unauthorized

**原因**: Token无效或过期

**解决**:
1. 重新登录获取新Token
2. 检查后端JWT验证逻辑
3. 查看Token是否正确携带

---

## ✅ 最终确认清单

### 前端开发者确认

- [✅] 所有文件已创建/更新
- [✅] UI显示正常美观
- [✅] 状态管理正确
- [✅] API调用正确
- [✅] 错误处理完善
- [✅] 代码通过TypeScript检查
- [✅] 无控制台错误
- [✅] 文档完整

### 后端开发者确认

- [⏳] POST /api/ai/chat 接口已实现
- [⏳] JWT验证已实现
- [⏳] 模型路由已实现
- [⏳] CORS已配置
- [⏳] 测试通过
- [⏳] 日志记录正常
- [⏳] 错误处理完善

### 测试人员确认

- [⏳] UI测试通过
- [⏳] 功能测试通过
- [⏳] 安全测试通过
- [⏳] 边界测试通过
- [⏳] 性能测试通过

---

## 🚀 上线清单

### 上线前

1. [⏳] 前后端联调完成
2. [⏳] 所有测试通过
3. [⏳] 代码审查通过
4. [⏳] 文档更新完毕
5. [⏳] 生产环境配置就绪

### 上线时

1. [⏳] 更新 `BASE_URL` 为生产地址
2. [⏳] 关闭 Mock 模式：`USE_MOCK_DATA: false`
3. [⏳] 部署前端代码
4. [⏳] 部署后端代码
5. [⏳] 验证功能正常

### 上线后

1. [⏳] 监控错误日志
2. [⏳] 收集用户反馈
3. [⏳] 性能指标监控
4. [⏳] 准备回滚方案

---

## 📚 相关文档链接

- 📖 [完整实现指南](./docs/AI-MODEL-SWITCH-GUIDE.md)
- 🧪 [快速测试指南](./docs/AI-QUICK-TEST.md)
- 📊 [流程图文档](./docs/API-FLOW-DIAGRAM.md)
- ✅ [完成报告](./AI_MODEL_SWITCH_COMPLETE.md)

---

**验收人**: _______________  
**日期**: _______________  
**签字**: _______________

---

**版本**: 1.0  
**最后更新**: 2024-12-03  
**维护团队**: SUAT-GPT 开发组
