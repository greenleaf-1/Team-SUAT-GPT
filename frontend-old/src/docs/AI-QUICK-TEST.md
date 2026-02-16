# AI模型切换功能 - 快速测试指南

## 🚀 快速开始

### 1. 前端验证（3分钟）

#### 步骤1：检查文件是否创建
```bash
# 检查这些文件是否存在
ls -la /api/chat.ts
ls -la /components/AIChat.tsx
ls -la /utils/api-config.ts
```

#### 步骤2：启动前端应用
```bash
npm run dev
# 或
yarn dev
```

#### 步骤3：浏览器测试
1. 打开 `http://localhost:5173` (或你的端口)
2. 登录系统（获取JWT Token）
3. 进入"AI总入口"页面
4. 查看是否有模型选择器UI（两个按钮）

---

## 🧪 功能测试清单

### ✅ UI测试
- [ ] 能看到两个模型选择按钮：
  - 🏫 Qwen (内网) - 默认选中（紫色背景）
  - 🌐 Qwen (公网) - 未选中（白色背景）
- [ ] 点击按钮可以切换选中状态
- [ ] 聊天输入框正常显示
- [ ] 快速功能按钮正常显示

### ✅ 状态测试
1. **默认状态**
   ```javascript
   // 打开浏览器控制台
   // 应该看到默认选中 "qwen-internal"
   ```

2. **切换状态**
   - 点击"Qwen (公网)"按钮
   - 按钮应该变为紫色背景
   - 底部状态提示应显示"当前使用: 🌐 Qwen (公网)"

### ✅ API调用测试

#### 测试1：检查JWT Token
```javascript
// 在浏览器控制台执行
console.log('Token:', localStorage.getItem('authToken'));

// 预期结果：应该看到一个token字符串
// 如果是null，需要先登录
```

#### 测试2：发送测试消息
1. 在聊天框输入："你好"
2. 点击发送按钮
3. 打开 Network 标签页
4. 查找 `/api/ai/chat` 请求

**期望的请求头：**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**期望的请求体：**
```json
{
  "content": "你好",
  "modelKey": "qwen-internal"
}
```

#### 测试3：切换模型后测试
1. 点击"Qwen (公网)"按钮
2. 发送消息："测试公网模型"
3. 查看请求体中的 `modelKey` 应该是 `"qwen-public"`

---

## 🔍 调试指南

### 查看请求日志
前端会自动打印详细日志：

```
🚀 调用后端API: {content: "你好", modelKey: "qwen-internal"}
📤 发送聊天请求: {url: "http://localhost:8080/api/ai/chat", ...}
✅ 聊天响应成功: {success: true, contentLength: 123}
```

### 常见错误排查

#### 错误1: "未找到认证令牌，请先登录"
**原因**: localStorage中没有authToken
**解决**: 
```javascript
// 手动设置测试token（仅用于测试）
localStorage.setItem('authToken', 'test-token-123');
```

#### 错误2: 请求失败 404
**原因**: 后端未启动或URL配置错误
**解决**: 检查 `/utils/api-config.ts` 中的 `BASE_URL`

#### 错误3: CORS错误
**原因**: 后端未配置CORS
**解决**: 后端添加CORS配置（见下方）

---

## 🔧 后端配置检查清单

### 1. 端口确认
```java
# application.properties
server.port=8080
```

### 2. CORS配置
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173") // 前端地址
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

### 3. 最小可运行的Controller（用于测试）
```java
@RestController
@RequestMapping("/api/ai")
public class AIChatController {
    
    @PostMapping("/chat")
    public ResponseEntity<?> chat(
        @RequestHeader(value = "Authorization", required = false) String token,
        @RequestBody Map<String, String> request
    ) {
        // 记录日志
        System.out.println("收到请求:");
        System.out.println("Token: " + token);
        System.out.println("Content: " + request.get("content"));
        System.out.println("ModelKey: " + request.get("modelKey"));
        
        // 简单响应（测试用）
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("content", "这是来自后端的测试回复：" + request.get("content"));
        response.put("timestamp", new java.util.Date().toString());
        
        return ResponseEntity.ok(response);
    }
}
```

---

## 📊 测试结果示例

### ✅ 成功的请求示例

**请求：**
```http
POST http://localhost:8080/api/ai/chat
Content-Type: application/json
Authorization: Bearer mock-student-token-1733227800000

{
  "content": "你好，请介绍一下Java",
  "modelKey": "qwen-internal"
}
```

**响应：**
```json
{
  "success": true,
  "content": "Java是一种广泛使用的面向对象编程语言...",
  "timestamp": "2024-12-03T10:30:00Z"
}
```

**前端显示：**
- 用户消息显示在右侧（紫色气泡）
- AI回复显示在左侧（灰色气泡）
- 底部显示"当前使用: 🏫 Qwen (内网)"

---

## 🎯 验收标准

### 必须通过的测试
1. ✅ UI正常显示，无控制台错误
2. ✅ 能切换模型选择
3. ✅ 发送消息时，请求包含正确的modelKey
4. ✅ 请求头包含Authorization: Bearer <token>
5. ✅ 切换模型后，新请求使用新的modelKey

### Mock数据模式测试
如果后端未准备好，可以先用Mock模式：

```typescript
// /utils/api-config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
  USE_MOCK_DATA: true,  // ← 设置为true
};
```

**Mock模式下**：
- 消息会保存到localStorage
- 不会发送真实HTTP请求
- 适合前端独立开发

---

## 🐛 已知问题

### 问题1：模型切换后首次请求失败
**状态**: 已修复
**原因**: 状态更新延迟
**解决**: 使用函数式状态更新

### 问题2：Token过期后无提示
**状态**: 待优化
**建议**: 添加Token过期检测和自动刷新

---

## 📞 联系方式

遇到问题？
1. 检查浏览器控制台日志
2. 检查Network标签页的请求详情
3. 参考 `/docs/AI-MODEL-SWITCH-GUIDE.md` 完整文档

---

**最后更新**: 2024-12-03
**测试负责人**: 开发团队
