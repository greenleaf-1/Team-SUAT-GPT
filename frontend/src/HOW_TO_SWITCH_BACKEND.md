# 🔄 如何切换后端（Java ↔ Supabase）

## 🎯 一分钟快速切换

只需修改一个文件，即可在Java后端和Supabase后端之间切换！

---

## 📝 步骤

### **打开配置文件**
```
/config/backend.config.ts
```

### **修改 BACKEND_TYPE**

#### **方案A：使用 Java 后端（课程作业）**
```typescript
export const BACKEND_TYPE: BackendType = 'java';
```

#### **方案B：使用 Supabase 后端（快速测试）**
```typescript
export const BACKEND_TYPE: BackendType = 'supabase';
```

### **保存文件**
前端会自动重新加载，切换到新的后端。

---

## 🔍 查看当前后端

打开浏览器控制台（F12），查看输出：

### **Java 后端模式**
```
🔧 当前后端配置:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  类型: java
  地址: http://localhost:8080/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Java 后端模式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请确保您的 Java 后端已启动并运行在:
http://localhost:8080/api

如果后端未启动，请参考 /docs/JAVA_BACKEND_API.md
```

### **Supabase 后端模式**
```
🔧 当前后端配置:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  类型: supabase
  地址: Supabase Edge Functions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅  Supabase 后端模式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
使用云端 Supabase 服务，无需额外配置
```

---

## 🎨 修改 Java 后端地址

如果您的Java后端不在默认地址，修改配置：

```typescript
export const JAVA_BACKEND_CONFIG = {
  // 本地开发
  baseUrl: 'http://localhost:8080/api',
  
  // 或者远程服务器
  // baseUrl: 'http://192.168.1.100:8080/api',
  // baseUrl: 'https://your-domain.com/api',
  
  timeout: 10000,
  enableAuth: true,
};
```

---

## ⚠️ 注意事项

### **使用 Java 后端时：**
- ✅ 确保Java后端已启动
- ✅ 确保数据库已创建
- ✅ 确保CORS已配置
- ✅ 确保端口号正确
- ❌ 如果后端未启动，登录会失败

### **使用 Supabase 后端时：**
- ✅ 无需任何配置
- ✅ 开箱即用
- ✅ 云端托管，免费使用
- ✅ 适合快速原型和功能测试

---

## 🧪 测试切换是否成功

### **测试方法1：查看学生登录页面**

**Java模式：**
```
登录页面显示：
🔧 Java 后端模式
请确保 Java 后端已启动
```

**Supabase模式：**
```
登录页面显示：
☁️ Supabase 后端模式
使用云端服务，无需配置
```

### **测试方法2：尝试登录**

**Java模式：**
- 如果Java后端未启动 → 登录失败，显示连接错误
- 如果Java后端已启动 → 登录成功

**Supabase模式：**
- 使用演示账号（zhangsan/123456）
- 应该能立即登录成功

---

## 💡 开发建议

### **开发Java后端时的工作流程：**

```
1. 切换到 Supabase 模式
   ↓
2. 测试前端功能是否正常
   ↓
3. 切换到 Java 模式
   ↓
4. 开发Java后端
   ↓
5. 测试Java后端是否正确
   ↓
6. 提交作业（使用Java模式）
```

### **为什么要这样做？**

- ✅ Supabase可以快速验证前端功能
- ✅ 不用等后端开发完成就能测试UI
- ✅ 可以对比两种后端的行为
- ✅ 确保Java后端实现正确

---

## 🚨 常见问题

### **Q: 切换后仍然连接到旧后端？**
**A:** 清除浏览器缓存并刷新页面（Ctrl + Shift + R）

### **Q: Java模式下登录失败？**
**A:** 检查：
1. Java后端是否已启动？
2. 端口是否正确？
3. CORS是否配置？
4. 数据库是否有数据？

### **Q: 能同时使用两个后端吗？**
**A:** 不能。同一时间只能使用一个后端。但可以随时切换。

---

## 📊 两种后端对比

| 特性 | Java 后端 | Supabase 后端 |
|------|----------|---------------|
| 配置难度 | ⭐⭐⭐⭐ | ⭐ |
| 开发成本 | 高（需要写代码） | 低（开箱即用） |
| 学习价值 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 适合场景 | 课程作业 | 快速原型 |
| 部署成本 | 需要服务器 | 免费云端 |
| 性能 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 课程要求 | ✅ 符合 | ❌ 不符合 |

---

## ✅ 总结

**切换后端非常简单：**
```typescript
// /config/backend.config.ts

// Java 后端（提交作业用）
export const BACKEND_TYPE: BackendType = 'java';

// Supabase 后端（快速测试用）
export const BACKEND_TYPE: BackendType = 'supabase';
```

**记住这一行代码，随时切换！** 🚀

---

**需要帮助？**
- Java后端API文档: `/docs/JAVA_BACKEND_API.md`
- 快速开始指南: `/docs/QUICK_START.md`
- 集成说明: `/README_JAVA_INTEGRATION.md`
