# ☕ Java后端对接完整指南

## 📌 重要说明

### ✅ 已完成的工作

**前端已完成Supabase移除和API改造：**
- ✅ 移除了所有Supabase相关组件和配置
- ✅ 创建了新的API调用层 (`/utils/api-new.ts`)
- ✅ 配置了API端点常量 (`/utils/api-config.ts`)
- ✅ 所有组件已改用新的API调用方式
- ✅ 内置Mock数据支持，可独立开发测试

**当前状态：**
- 前端完全独立，使用Mock数据运行
- AI功能直接调用内网AI服务（不经过后端）
- 等待Java后端实现，可随时对接

---

## 🎯 开发顺序建议

### 推荐：**先做后端，再对接前端**

**理由：**
1. 后端定义数据结构和API规范
2. 前端已经用Mock数据完成开发
3. 后端完成后只需切换配置即可
4. 可以并行开发，互不阻塞

### 开发流程

```
阶段1: 后端框架（建议Gemini帮你完成）
├── Spring Boot项目初始化
├── MySQL数据库配置
├── 创建实体类（Entity）
├── 创建仓库层（Repository）
└── 创建服务层（Service）

阶段2: 实现API接口
├── 认证接口（学生/教师登录）
├── 学生端接口
├── 教师管理接口
└── JWT安全配置

阶段3: 前端对接
├── 修改配置文件
└── 测试所有功能

预计时间：3-5天
```

---

## 🔧 前端配置（对接时使用）

### 步骤1：修改API配置

编辑 `/utils/api-config.ts`：

```typescript
export const API_CONFIG = {
  // 修改为你的Java后端地址
  BASE_URL: 'http://localhost:8080/api',
  
  // 关闭Mock数据
  USE_MOCK_DATA: false,  // 改为 false
};
```

### 步骤2：测试连接

启动应用后：
1. 打开浏览器控制台（F12）
2. 查看Network标签页
3. 登录系统，观察API请求

---

## 📋 后端需要实现的所有接口

详见 `/BACKEND_INTEGRATION_GUIDE.md` 文档，包含：
- 完整的API接口清单（10个分类，30+接口）
- 请求/响应格式示例
- 数据库表结构（9个表）
- 前端对接位置说明

---

## 🗄️ 数据库表（简要）

### 核心表：
1. **students** - 学生信息
2. **teachers** - 教师信息
3. **courses** - 课程信息
4. **student_courses** - 选课关系
5. **homework** - 作业信息
6. **homework_submissions** - 作业提交
7. **notifications** - 通知消息
8. **chapters** - 课程章节
9. **chat_history** - AI聊天记录

详细SQL见 `/BACKEND_INTEGRATION_GUIDE.md`

---

## 🔐 认证方式建议

### 使用JWT Token

**登录流程：**
```
1. 学生/教师提交用户名密码
2. 后端验证成功，生成JWT Token
3. 返回Token和用户信息
4. 前端存储Token到localStorage
5. 后续请求在Header中携带Token
```

**Spring Boot实现参考：**
```java
@PostMapping("/auth/student/login")
public ResponseEntity<?> studentLogin(@RequestBody LoginRequest request) {
    // 验证学生账号密码
    Student student = studentService.authenticate(
        request.getStudentId(), 
        request.getPassword()
    );
    
    if (student == null) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("用户名或密码错误"));
    }
    
    // 生成JWT Token
    String token = jwtService.generateToken(student.getId(), "STUDENT");
    
    // 返回
    return ResponseEntity.ok(new LoginResponse(token, student));
}
```

---

## 📡 API调用示例

### 前端如何调用（已实现）

```typescript
// 学生登录
import { studentLogin } from '../utils/api-new';

const result = await studentLogin({
  studentId: '2023001',
  password: '123456'
});

// 自动存储token
localStorage.setItem('authToken', result.token);

// 后续请求会自动携带token
const courses = await getCourses();
```

### 后端需要验证Token

每个需要认证的接口都应验证JWT：

```java
@GetMapping("/student/courses")
public ResponseEntity<?> getStudentCourses(
    @RequestHeader("Authorization") String authHeader
) {
    // 提取token
    String token = authHeader.replace("Bearer ", "");
    
    // 验证token并获取学生ID
    Long studentId = jwtService.validateAndGetUserId(token);
    
    if (studentId == null) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("未授权"));
    }
    
    // 查询该学生的课程
    List<Course> courses = courseService.getStudentCourses(studentId);
    
    return ResponseEntity.ok(courses);
}
```

---

## 🚀 快速开始（Gemini实现）

### 告诉Gemini的内容：

```
我需要创建一个Java Spring Boot后端，用于对接一个React前端的学习管理系统。

项目要求：
1. 使用Spring Boot 3.x
2. MySQL 8.0数据库
3. JWT认证
4. RESTful API

请帮我：
1. 创建Maven项目结构
2. 配置application.yml
3. 创建9个实体类（见BACKEND_INTEGRATION_GUIDE.md的数据库表）
4. 实现30+个API接口（见BACKEND_INTEGRATION_GUIDE.md）
5. 配置CORS允许前端跨域
6. 添加全局异常处理

数据库表结构和API接口详见我提供的BACKEND_INTEGRATION_GUIDE.md文档。
```

---

## 📦 推荐的Spring Boot依赖

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
    
    <!-- Spring Security + JWT -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

---

## 🔍 测试后端接口

### 使用Postman测试

**1. 测试登录：**
```
POST http://localhost:8080/api/auth/student/login
Content-Type: application/json

{
  "studentId": "2023001",
  "password": "123456"
}
```

**2. 测试需要认证的接口：**
```
GET http://localhost:8080/api/student/courses
Authorization: Bearer {你的token}
```

---

## ⚠️ CORS配置（必须）

后端必须配置CORS，否则前端无法访问：

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许前端地址
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:5173");
        
        // 允许所有方法
        config.addAllowedMethod("*");
        
        // 允许所有请求头
        config.addAllowedHeader("*");
        
        // 允许携带凭证
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

---

## 📝 前端已完成的改造

### 移除的文件：
- ❌ `/components/DataInitializer.tsx`
- ❌ `/components/AdminDataInitializer.tsx`
- ❌ `/components/ConnectionStatus.tsx`
- ❌ `/components/Edge403Notice.tsx`
- ❌ `/components/DebugPanel.tsx`
- ❌ `/utils/supabase/` 目录相关

### 新增的文件：
- ✅ `/utils/api-config.ts` - API配置
- ✅ `/utils/api-new.ts` - API调用封装（含Mock）
- ✅ `/BACKEND_INTEGRATION_GUIDE.md` - 完整对接文档

### 修改的组件：
- ✅ `/components/AIChat.tsx`
- ✅ `/components/LearningCenter.tsx`
- ✅ `/components/NotificationCenter.tsx`
- ✅ `/components/PersonalCenter.tsx`
- ✅ `/components/AdminLogin.tsx`
- ✅ `/components/AdminDashboard.tsx`
- ✅ `/App.tsx`

---

## 🎓 给Gemini的完整Prompt

将以下内容复制给Gemini：

```
我需要你帮我创建一个Java Spring Boot后端项目，用于学习管理系统（SUAT-GPT）。

## 项目要求

### 技术栈
- Spring Boot 3.2.x
- MySQL 8.0
- JWT认证
- Maven构建

### 数据库表（9个表）
详见附件中的BACKEND_INTEGRATION_GUIDE.md文档的"数据库表结构"部分。

包括：students, teachers, courses, student_courses, homework, 
homework_submissions, notifications, chapters, chat_history

### API接口（30+个）
详见附件中的BACKEND_INTEGRATION_GUIDE.md文档的"后端需要实现的接口清单"部分。

分为5大模块：
1. 认证相关（2个接口）
2. 学生端（4个接口）
3. 课程详情（4个接口）
4. AI聊天（2个接口）
5. 教师管理（10个接口）

### 项目结构建议

```
src/main/java/com/suat/lms/
├── config/           # 配置类（CORS, Security, JWT）
├── entity/           # 实体类（9个）
├── repository/       # JPA仓库（9个）
├── service/          # 业务逻辑
│   ├── impl/         # 服务实现
│   └── ...
├── controller/       # 控制器（5个）
├── dto/              # 数据传输对象
│   ├── request/      # 请求DTO
│   └── response/     # 响应DTO
├── security/         # 安全相关（JWT工具类等）
├── exception/        # 异常处理
└── LmsApplication.java
```

### 需要实现的功能

1. **JWT认证系统**
   - 生成token
   - 验证token
   - 区分学生和教师token

2. **学生登录认证**
   - 使用学号+密码
   - 密码BCrypt加密

3. **教师登录认证**
   - 使用用户名+密码
   - 密码BCrypt加密

4. **学生端功能**
   - 获取个人信息
   - 查看选课列表
   - 查看通知
   - 标记通知已读

5. **课程功能**
   - 课程详情
   - 章节列表
   - 作业列表
   - 提交作业

6. **教师管理功能**
   - 学生管理（增删改查）
   - 课程管理（增删改查）
   - 作业管理（创建、查看提交）
   - 发送通知
   - 统计数据

7. **AI聊天记录**
   - 保存聊天记录
   - 获取历史记录

### 配置要求

1. **application.yml**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/suat_lms?useSSL=false&serverTimezone=UTC
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
server:
  port: 8080
jwt:
  secret: your-secret-key-here-make-it-long-and-secure
  expiration: 86400000
```

2. **CORS配置**
   - 允许 http://localhost:3000
   - 允许 http://localhost:5173
   - 允许所有方法和头

3. **全局异常处理**
   - 返回统一的JSON格式

### 初始数据

请创建一个SQL文件 (init.sql)，包含：
- 1个教师账号（username: admin, password: admin123）
- 3个学生账号（学号2023001-2023003，密码都是123456）
- 3门课程
- 一些测试数据

### 输出要求

请生成：
1. 完整的Maven pom.xml
2. application.yml配置
3. 所有实体类
4. 所有Repository接口
5. 所有Service接口和实现
6. 所有Controller
7. JWT工具类
8. CORS配置类
9. 全局异常处理
10. init.sql初始化脚本

请确保代码完整、可直接运行，并包含必要的注释。
```

---

## ✅ 验证清单

后端完成后，检查：

- [ ] 所有API接口已实现
- [ ] JWT认证工作正常
- [ ] CORS配置正确
- [ ] 数据库表创建成功
- [ ] 初始数据导入成功
- [ ] Postman测试通过
- [ ] 前端可以成功调用

---

## 📞 问题排查

### 前端连接不上后端

1. 检查后端是否启动（端口8080）
2. 检查CORS配置
3. 打开浏览器控制台查看错误
4. 检查Network标签页的请求详情

### Token验证失败

1. 检查token格式：`Bearer {token}`
2. 检查token是否过期
3. 检查JWT secret是否一致

### 数据返回格式错误

1. 确保后端返回的JSON格式与前端期望一致
2. 检查字段名是否匹配（驼峰命名）

---

**最后更新：** 2025-11-29  
**文档版本：** 1.0  
**状态：** 前端已准备就绪，等待后端实现
