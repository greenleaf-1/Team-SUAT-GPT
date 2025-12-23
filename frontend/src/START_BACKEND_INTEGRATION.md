# 🚀 后端对接快速开始

## ✅ 当前状态

**前端：已完成所有准备工作**
- ✅ 移除了所有Supabase依赖
- ✅ 创建了新的API调用层
- ✅ 所有组件改用新API
- ✅ 内置Mock数据，可独立运行
- ✅ 配置文件已准备好

**后端：等待实现**
- ⏳ Java Spring Boot项目
- ⏳ MySQL数据库
- ⏳ 30+个API接口

---

## 🎯 重要结论：应该先做后端！

### 为什么？

1. **数据结构驱动** - 后端定义数据库表和API规范
2. **前端已就绪** - 前端用Mock数据已完成开发
3. **类型安全** - Java强类型，前端可根据后端定义接口
4. **并行友好** - 互不阻塞

### 开发流程

```
你现在的位置 ➡️  第1步
                 ⬇️
        【第1步】实现Java后端（3-5天）
                 ⬇️
        【第2步】修改前端配置（5分钟）
                 ⬇️
        【第3步】测试对接（1天）
                 ⬇️
                完成！
```

---

## 📚 重要文档

### 1️⃣ `/BACKEND_INTEGRATION_GUIDE.md` ⭐ 最重要
**内容：**
- 完整的30+个API接口清单
- 每个接口的请求/响应示例
- 9个数据库表的SQL结构
- 前端对接位置说明

**适合：** 详细了解所有接口要求

---

### 2️⃣ `/JAVA_BACKEND_SETUP.md` ⭐ 给Gemini用
**内容：**
- 完整的Gemini Prompt
- Spring Boot项目要求
- 技术栈建议
- 项目结构建议

**适合：** 直接复制给Gemini生成代码

---

### 3️⃣ 前端配置文件（对接时使用）

**/utils/api-config.ts** - 核心配置
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api', // 后端地址
  USE_MOCK_DATA: false, // 关闭Mock，使用真实后端
};
```

---

## 🔥 立即开始

### 方案A：让Gemini帮你（推荐）

1. **打开Gemini**
2. **复制以下内容：**

```
我需要你帮我创建一个Java Spring Boot后端项目。

项目要求详见我上传的两个文档：
1. BACKEND_INTEGRATION_GUIDE.md - 接口和数据库详细说明
2. JAVA_BACKEND_SETUP.md - 完整的实现要求

请根据这两个文档生成完整的Spring Boot项目代码，包括：
- pom.xml
- 所有实体类、Repository、Service、Controller
- JWT认证
- CORS配置
- 初始数据SQL脚本

确保代码可以直接运行。
```

3. **上传文档**
   - `BACKEND_INTEGRATION_GUIDE.md`
   - `JAVA_BACKEND_SETUP.md`

4. **等待Gemini生成代码**

---

### 方案B：自己写（如果你熟悉Spring Boot）

1. 查看 `/BACKEND_INTEGRATION_GUIDE.md`
2. 创建Spring Boot项目
3. 实现9个实体类
4. 实现30+个API接口
5. 配置JWT和CORS

---

## 📋 API接口概览（30+个）

### 认证 (2个)
- POST `/api/auth/student/login` - 学生登录
- POST `/api/auth/teacher/login` - 教师登录

### 学生端 (4个)
- GET `/api/student/profile` - 个人信息
- GET `/api/student/courses` - 课程列表
- GET `/api/student/notifications` - 通知列表
- PUT `/api/student/notifications/:id/read` - 标记已读

### 课程 (4个)
- GET `/api/courses/:id` - 课程详情
- GET `/api/courses/:id/chapters` - 章节列表
- GET `/api/courses/:id/homework` - 作业列表
- POST `/api/courses/:courseId/homework/:homeworkId/submit` - 提交作业

### AI聊天 (2个)
- GET `/api/ai/chat/history` - 聊天历史
- POST `/api/ai/chat` - 保存消息

### 教师管理 (10个)
- GET `/api/admin/students` - 学生列表
- POST `/api/admin/students` - 创建学生
- PUT `/api/admin/students/:id` - 更新学生
- DELETE `/api/admin/students/:id` - 删除学生
- GET `/api/admin/courses` - 课程列表
- POST `/api/admin/courses` - 创建课程
- DELETE `/api/admin/courses/:id` - 删除课程
- POST `/api/admin/homework` - 创建作业
- POST `/api/admin/notifications/broadcast` - 广播通知
- GET `/api/admin/analytics` - 统计数据

详细的请求/响应格式见 `BACKEND_INTEGRATION_GUIDE.md`

---

## 🗄️ 数据库表（9个）

1. **students** - 学生信息
2. **teachers** - 教师信息  
3. **courses** - 课程信息
4. **student_courses** - 选课关系
5. **homework** - 作业信息
6. **homework_submissions** - 作业提交
7. **notifications** - 通知消息
8. **chapters** - 课程章节
9. **chat_history** - AI聊天记录

完整SQL见 `BACKEND_INTEGRATION_GUIDE.md`

---

## ⚡ 后端完成后的对接步骤

### 1. 修改前端配置（5分钟）

编辑 `/utils/api-config.ts`：
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api', // 你的后端地址
  USE_MOCK_DATA: false, // 改为false
};
```

### 2. 启动后端
```bash
cd your-spring-boot-project
mvn spring-boot:run
```

### 3. 启动前端
```bash
npm run dev
```

### 4. 测试
- 访问 http://localhost:3000
- 尝试登录（默认账号见后端init.sql）
- 查看浏览器控制台（F12）Network标签

---

## 🐛 常见问题

### Q: CORS跨域错误？
**A:** 后端必须配置CORS，允许前端地址

### Q: 401未授权错误？
**A:** 检查JWT token是否正确，格式：`Bearer {token}`

### Q: 数据格式不匹配？
**A:** 确保后端返回的字段名与文档一致（驼峰命名）

---

## 📞 需要帮助？

1. 查看 `/BACKEND_INTEGRATION_GUIDE.md` 了解详细接口要求
2. 查看 `/JAVA_BACKEND_SETUP.md` 了解实现建议
3. 使用浏览器开发工具（F12）查看Network错误
4. 检查后端日志输出

---

## ✅ 检查清单

后端实现前：
- [ ] 已阅读 `BACKEND_INTEGRATION_GUIDE.md`
- [ ] 已阅读 `JAVA_BACKEND_SETUP.md`
- [ ] 理解所有API接口要求
- [ ] 准备好MySQL数据库

后端实现后：
- [ ] 所有接口已实现
- [ ] CORS配置完成
- [ ] JWT认证工作正常
- [ ] 初始数据已导入
- [ ] Postman测试通过

前端对接后：
- [ ] 修改了api-config.ts
- [ ] 前端可以登录
- [ ] 所有功能正常
- [ ] 无控制台错误

---

**现在，去找Gemini帮你生成后端代码吧！** 🚀

祝你的Java课程作业顺利完成！
