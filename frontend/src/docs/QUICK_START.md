# 🚀 SUAT-GPT 快速开始指南

## 📋 目录
1. [系统概述](#系统概述)
2. [后端选择](#后端选择)
3. [Java后端配置](#java后端配置)
4. [学生端使用](#学生端使用)
5. [教师端使用](#教师端使用)
6. [常见问题](#常见问题)

---

## 🎯 系统概述

**SUAT-GPT** 是一个无纸化学习管理系统，包含：

- ✅ **学生端**: AI对话、学习中心、通知中心、个人中心
- ✅ **教师端**: 课程管理、学生管理、作业管理、通知推送
- ✅ **认证系统**: 学生登录、教师登录
- ✅ **AI集成**: Deepseek-R1、Qwen3、Embedding接口

---

## 🔧 后端选择

系统支持两种后端模式：

### **方案1：Java 后端（课程作业要求）**

```
前端 (React) → Java 后端 (Spring Boot) → MySQL 数据库
```

**优点**:
- ✅ 符合Java课程作业要求
- ✅ 学习Java Web开发
- ✅ 完整的后端开发经验

**缺点**:
- ❌ 需要自己开发后端
- ❌ 需要配置数据库
- ❌ 需要部署服务器

---

### **方案2：Supabase 后端（快速原型）**

```
前端 (React) → Supabase Edge Functions → Supabase Database
```

**优点**:
- ✅ 开箱即用，无需配置
- ✅ 免费云端托管
- ✅ 实时数据同步

**缺点**:
- ❌ 不符合Java课程要求

---

## ⚙️ Java后端配置

### **第1步：修改前端配置**

打开 `/config/backend.config.ts`，修改：

```typescript
export const BACKEND_TYPE: BackendType = 'java';  // 切换到Java后端

export const JAVA_BACKEND_CONFIG = {
  baseUrl: 'http://localhost:8080/api',  // 本地开发
  // baseUrl: 'http://your-server-ip:8080/api',  // 生产环境
  timeout: 10000,
  enableAuth: true,
};
```

---

### **第2步：创建Java后端项目**

#### **技术栈**
```
Java 17+
Spring Boot 3.x
Spring Data JPA
MySQL 8.0+
Spring Security + JWT
```

#### **数据库创建**
```sql
CREATE DATABASE suat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### **执行建表语句**
参考 `/docs/JAVA_BACKEND_API.md` 中的数据库设计章节

---

### **第3步：实现API接口**

参考 `/docs/JAVA_BACKEND_API.md`，实现以下接口：

#### **认证接口**
- `POST /api/auth/student/login` - 学生登录
- `POST /api/auth/teacher/login` - 教师登录

#### **学生端接口**
- `GET /api/courses` - 获取课程列表
- `GET /api/homework/{courseId}` - 获取作业列表
- `POST /api/submissions/{homeworkId}` - 提交作业
- `GET /api/notifications` - 获取通知
- ...

#### **教师端接口**
- `POST /api/admin/students` - 添加学生
- `PUT /api/admin/students/{id}` - 更新学生信息
- `DELETE /api/admin/students/{id}` - 删除学生
- `POST /api/admin/courses` - 创建课程
- `POST /api/admin/notifications/broadcast` - 推送通知
- ...

---

### **第4步：配置CORS**

在Spring Boot中配置跨域：

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(false)
                    .maxAge(3600);
            }
        };
    }
}
```

---

### **第5步：启动后端服务**

```bash
# Maven
mvn spring-boot:run

# Gradle
./gradlew bootRun

# 直接运行JAR
java -jar target/suat-backend-0.0.1-SNAPSHOT.jar
```

后端将运行在 `http://localhost:8080`

---

### **第6步：测试连接**

前端启动后，检查浏览器控制台：

```
🔧 当前后端配置:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  类型: java
  地址: http://localhost:8080/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

如果看到此信息，说明配置成功！

---

## 👨‍🎓 学生端使用

### **登录**

1. 打开应用，看到学生登录页面
2. 输入演示账号：
   - 用户名: `zhangsan`
   - 密码: `123456`
3. 点击"登录"或"使用演示账号登录"

### **主要功能**

#### **1. AI 对话**
- 点击底部导航栏"AI"
- 输入问题，AI助手回答
- 支持多轮对话

#### **2. 学习中心**
- 查看所有课程
- 点击课程进入详情
- 查看章节内容
- 完成作业

#### **3. 通知中心**
- 查看系统通知
- 作业批改通知
- 课程更新通知

#### **4. 个人中心**
- 查看个人信息
- 修改头像、邮箱等
- 查看学习统计

---

## 👨‍🏫 教师端使用

### **登录**

1. 点击右上角"教师入口 →"
2. 输入教师账号：
   - 用户名: `admin@suat.edu.cn`
   - 密码: `password123`
3. 进入教师管理后台

---

### **主要功能**

#### **1. 数据概览**
- 查看课程总数
- 查看学生总数
- 查看作业统计
- 查看平均分数

---

#### **2. 课程管理**

**创建课程：**
1. 点击"创建课程"按钮
2. 填写课程信息：
   ```
   课程名称: 人工智能基础
   教师姓名: 张教授
   课程描述: AI课程介绍
   总章节数: 12
   封面图片URL: https://...（可选）
   ```
3. 点击"创建"
4. **学生端立即看到新课程！**

**编辑/删除课程：**
- 点击课程卡片上的"编辑"或"删除"按钮

---

#### **3. 学生管理**

**添加学生：**
1. 点击"添加学生"按钮
2. 填写学生信息：
   ```
   用户名: lisi
   密码: 123456
   姓名: 李四
   学号: 2021002
   邮箱: lisi@suat.edu.cn
   专业: 软件工程
   班级: 21软工1班
   ```
3. 点击"添加"
4. **学生可以用此账号登录！**

**编辑学生信息：**
- 点击学生行的"编辑"图标
- 修改邮箱、专业、班级等信息

**重置学生密码：**
- 点击学生行的"🔑"图标
- 输入新密码

**删除学生：**
- 点击学生行的"删除"图标
- 确认删除

---

#### **4. 作业管理**

**发布作业：**
1. 点击"发布作业"按钮
2. 填写作业信息：
   ```
   选择课程: 高等数学
   作业标题: 第一章课后习题
   章节: 1
   截止日期: 2024-12-31
   总分: 100
   ```
3. 点击"发布"
4. **学生端立即看到新作业！**

**批改作业：**
- 查看学生提交
- 打分并写反馈
- 保存后学生收到通知

---

#### **5. 通知推送**

**发送通知：**
1. 选择通知类型（系统/课程/作业/考试）
2. 填写标题和内容：
   ```
   标题: 周末考试提醒
   内容: 本周六上午9:00进行期中考试，请准时参加
   ```
3. 点击"发送给所有学生"
4. **所有学生立即收到通知！**

---

## ❓ 常见问题

### **Q1: 前端提示"Java后端未启动"**

**A:** 检查以下几点：
1. Java后端是否已启动？
2. 端口是否正确（默认8080）？
3. 防火墙是否阻止？
4. CORS是否配置正确？

```bash
# 测试后端是否启动
curl http://localhost:8080/api/health
```

---

### **Q2: 学生登录失败**

**A:** 检查：
1. 数据库中是否有该学生记录？
2. 密码是否正确？
3. 后端认证逻辑是否正确？

```sql
-- 查询学生账号
SELECT * FROM students WHERE username = 'zhangsan';
```

---

### **Q3: 如何添加初始数据？**

**A:** 两种方式：

**方式1：通过教师后台添加**
- 登录教师后台
- 在"学生管理"中添加学生账号

**方式2：直接插入数据库**
```sql
-- 插入学生账号（密码需要BCrypt加密）
INSERT INTO students (id, username, password, name, student_id, email, major, class_name) 
VALUES ('student-001', 'zhangsan', '$2a$10$...', '张三', '2021001', 'zhangsan@suat.edu.cn', '计算机科学与技术', '21计科1班');
```

---

### **Q4: 数据不同步怎么办？**

**A:** 
1. 检查后端API是否返回正确
2. 检查前端是否正确调用API
3. 打开浏览器控制台查看错误
4. 检查网络请求是否成功（Network标签）

---

### **Q5: 如何部署到生产环境？**

**前端部署：**
- 使用 Vercel / Netlify 部署
- 或使用 Nginx 托管

**后端部署：**
```bash
# 打包
mvn clean package

# 运行
java -jar target/suat-backend-0.0.1-SNAPSHOT.jar
```

**数据库：**
- 使用云数据库服务（阿里云RDS、腾讯云等）

---

### **Q6: 如何切换回Supabase后端？**

**A:** 修改 `/config/backend.config.ts`：

```typescript
export const BACKEND_TYPE: BackendType = 'supabase';
```

保存后前端会自动切换到Supabase云端后端。

---

## 📞 技术支持

如果遇到问题：

1. **查看控制台错误**（F12 → Console）
2. **查看网络请求**（F12 → Network）
3. **查看后端日志**
4. **参考完整API文档** `/docs/JAVA_BACKEND_API.md`

---

## ✅ 检查清单

在提交作业前，请确认：

- [ ] Java后端已完成并能正常启动
- [ ] 所有API接口都已实现
- [ ] 学生可以正常登录
- [ ] 教师可以添加学生
- [ ] 教师可以创建课程
- [ ] 教师可以推送通知
- [ ] 数据能正常同步到学生端
- [ ] CORS配置正确
- [ ] JWT认证正常工作
- [ ] 数据库设计合理

---

## 🎓 作业提交建议

**提交内容：**

1. **前端代码**（已完成）
2. **Java后端代码**（需要开发）
   - Controller 层
   - Service 层
   - Repository 层
   - Entity 层
   - 配置文件
3. **数据库脚本**
   - 建表SQL
   - 初始数据SQL
4. **README文档**
   - 项目介绍
   - 技术栈说明
   - 安装和运行步骤
   - 功能演示截图
5. **演示视频**（可选）
   - 学生登录流程
   - 教师添加学生
   - 创建课程
   - 推送通知

---

**祝您开发顺利！** 🚀

如有疑问，请参考：
- 完整API文档: `/docs/JAVA_BACKEND_API.md`
- 系统架构文档: `/SYSTEM_ARCHITECTURE.md`
- 教师平台文档: `/TEACHER_PLATFORM_COMPLETE.md`
