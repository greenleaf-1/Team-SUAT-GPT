# 📘 Java 后端 API 接口文档

## 📋 目录
- [技术栈要求](#技术栈要求)
- [数据库设计](#数据库设计)
- [接口规范](#接口规范)
- [学生端API](#学生端api)
- [教师端API](#教师端api)
- [认证机制](#认证机制)
- [错误处理](#错误处理)
- [部署说明](#部署说明)

---

## 🛠️ 技术栈要求

### **推荐技术栈**
```
Java 17+
Spring Boot 3.x
Spring Web (RESTful API)
Spring Data JPA (数据库操作)
Spring Security (认证授权)
MySQL 8.0+ / PostgreSQL 14+
Maven / Gradle (构建工具)
```

### **项目结构**
```
suat-backend/
├── src/main/java/com/suat/
│   ├── SuatApplication.java          # 启动类
│   ├── config/
│   │   ├── CorsConfig.java           # 跨域配置
│   │   └── SecurityConfig.java       # 安全配置
│   ├── controller/
│   │   ├── StudentAuthController.java    # 学生认证
│   │   ├── TeacherAuthController.java    # 教师认证
│   │   ├── CourseController.java         # 课程管理
│   │   ├── HomeworkController.java       # 作业管理
│   │   ├── NotificationController.java   # 通知管理
│   │   └── AdminController.java          # 管理员功能
│   ├── service/
│   │   ├── StudentService.java
│   │   ├── TeacherService.java
│   │   ├── CourseService.java
│   │   └── ...
│   ├── repository/
│   │   ├── StudentRepository.java
│   │   ├── TeacherRepository.java
│   │   └── ...
│   └── entity/
│       ├── Student.java
│       ├── Teacher.java
│       ├── Course.java
│       └── ...
└── src/main/resources/
    ├── application.properties    # 配置文件
    └── data.sql                  # 初始数据
```

---

## 🗄️ 数据库设计

### **1. 学生表 (students)**
```sql
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    major VARCHAR(100),
    class_name VARCHAR(50),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_username ON students(username);
CREATE INDEX idx_student_id ON students(student_id);
```

### **2. 教师表 (teachers)**
```sql
CREATE TABLE teachers (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. 课程表 (courses)**
```sql
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    teacher VARCHAR(100) NOT NULL,
    description TEXT,
    total_chapters INT DEFAULT 0,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **4. 作业表 (homework)**
```sql
CREATE TABLE homework (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    chapter INT NOT NULL,
    deadline TIMESTAMP,
    total_score INT DEFAULT 100,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### **5. 作业提交表 (submissions)**
```sql
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    homework_id VARCHAR(50) NOT NULL,
    content TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted',
    score INT,
    feedback TEXT,
    graded_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (user_id, homework_id)
);
```

### **6. 通知表 (notifications)**
```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);
```

### **7. 学习进度表 (progress)**
```sql
CREATE TABLE progress (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    current_chapter INT DEFAULT 1,
    completed_chapters INT DEFAULT 0,
    last_position INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (user_id, course_id)
);
```

### **8. 书签表 (bookmarks)**
```sql
CREATE TABLE bookmarks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    chapter INT NOT NULL,
    page INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### **9. 笔记表 (notes)**
```sql
CREATE TABLE notes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    chapter INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

---

## 🔐 认证机制

### **JWT Token 方案（推荐）**

#### **登录流程**
```java
// 1. 学生/教师登录
POST /api/auth/student/login
POST /api/auth/teacher/login

Request Body:
{
  "username": "zhangsan",
  "password": "123456"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "student-001",
    "username": "zhangsan",
    "name": "张三",
    "role": "student"
  }
}
```

#### **认证请求**
```java
// 后续所有请求需要携带 Token
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

#### **Spring Security 配置示例**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("TEACHER")
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

---

## 📡 接口规范

### **通用响应格式**

#### **成功响应**
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

#### **失败响应**
```json
{
  "success": false,
  "error": "错误信息",
  "code": 400
}
```

### **HTTP 状态码**
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器错误

---

## 👨‍🎓 学生端API

### **1. 学生认证**

#### **学生登录**
```
POST /api/auth/student/login
```
**Request Body:**
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "id": "student-001",
    "username": "zhangsan",
    "name": "张三",
    "studentId": "2021001",
    "email": "zhangsan@suat.edu.cn",
    "major": "计算机科学与技术",
    "class": "21计科1班"
  }
}
```

#### **获取学生信息**
```
GET /api/student/profile
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "student": {
    "id": "student-001",
    "name": "张三",
    "studentId": "2021001",
    "email": "zhangsan@suat.edu.cn",
    "major": "计算机科学与技术",
    "class": "21计科1班",
    "avatar": "https://..."
  }
}
```

#### **更新学生信息**
```
PUT /api/student/profile
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "email": "newemail@suat.edu.cn",
  "phone": "13800138000"
}
```

---

### **2. 课程API**

#### **获取所有课程**
```
GET /api/courses
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "course-001",
      "name": "高等数学",
      "teacher": "王教授",
      "description": "高等数学基础课程",
      "totalChapters": 10,
      "coverImage": "https://...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **获取课程详情**
```
GET /api/courses/{courseId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "course": {
    "id": "course-001",
    "name": "高等数学",
    "teacher": "王教授",
    "description": "高等数学基础课程",
    "totalChapters": 10,
    "chapters": [
      {
        "id": 1,
        "title": "第一章 函数与极限",
        "content": "..."
      }
    ]
  }
}
```

---

### **3. 作业API**

#### **获取课程作业列表**
```
GET /api/homework/{courseId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "homework": [
    {
      "id": "hw-001",
      "courseId": "course-001",
      "title": "第一章课后习题",
      "chapter": 1,
      "deadline": "2024-12-31T23:59:59Z",
      "totalScore": 100,
      "status": "active",
      "description": "完成第1-10题"
    }
  ]
}
```

#### **获取作业提交详情**
```
GET /api/submissions/{homeworkId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "sub-001",
    "homeworkId": "hw-001",
    "content": "作业答案内容...",
    "submittedAt": "2024-11-20T10:00:00Z",
    "status": "graded",
    "score": 85,
    "feedback": "完成良好，但第3题有误"
  }
}
```

#### **提交作业**
```
POST /api/submissions/{homeworkId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "content": "作业答案内容..."
}
```
**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "sub-001",
    "homeworkId": "hw-001",
    "status": "submitted",
    "submittedAt": "2024-11-20T10:00:00Z"
  }
}
```

---

### **4. 通知API**

#### **获取通知列表**
```
GET /api/notifications
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif-001",
      "type": "homework",
      "title": "新作业发布",
      "message": "高等数学第一章作业已发布",
      "isRead": false,
      "category": "作业通知",
      "createdAt": "2024-11-20T08:00:00Z"
    }
  ]
}
```

#### **标记通知为已读**
```
PUT /api/notifications/{notificationId}/read
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "message": "通知已标记为已读"
}
```

---

### **5. 学习进度API**

#### **获取课程学习进度**
```
GET /api/progress/{courseId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "progress": {
    "courseId": "course-001",
    "currentChapter": 3,
    "completedChapters": 2,
    "lastPosition": 150
  }
}
```

#### **更新学习进度**
```
POST /api/progress/{courseId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "currentChapter": 3,
  "completedChapters": 2,
  "lastPosition": 150
}
```

---

### **6. 书签API**

#### **获取书签列表**
```
GET /api/bookmarks/{courseId}
Headers: Authorization: Bearer {token}
```

#### **添加书签**
```
POST /api/bookmarks/{courseId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "chapter": 1,
  "page": 15,
  "note": "重要知识点"
}
```

#### **删除书签**
```
DELETE /api/bookmarks/{courseId}/{bookmarkId}
Headers: Authorization: Bearer {token}
```

---

### **7. 笔记API**

#### **获取笔记列表**
```
GET /api/notes/{courseId}
Headers: Authorization: Bearer {token}
```

#### **添加笔记**
```
POST /api/notes/{courseId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "chapter": 1,
  "content": "笔记内容..."
}
```

#### **更新笔记**
```
PUT /api/notes/{courseId}/{noteId}
Headers: Authorization: Bearer {token}
```

#### **删除笔记**
```
DELETE /api/notes/{courseId}/{noteId}
Headers: Authorization: Bearer {token}
```

---

## 👨‍🏫 教师端API

### **1. 教师认证**

#### **教师登录**
```
POST /api/auth/teacher/login
```
**Request Body:**
```json
{
  "username": "admin@suat.edu.cn",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "teacher": {
    "id": "teacher-001",
    "username": "admin@suat.edu.cn",
    "name": "管理员",
    "email": "admin@suat.edu.cn",
    "role": "teacher"
  }
}
```

---

### **2. 课程管理**

#### **获取所有课程（教师）**
```
GET /api/admin/courses
Headers: Authorization: Bearer {token}
```

#### **创建课程**
```
POST /api/admin/courses
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "name": "人工智能基础",
  "teacher": "张教授",
  "description": "AI课程介绍",
  "totalChapters": 12,
  "coverImage": "https://..."
}
```
**Response:**
```json
{
  "success": true,
  "course": {
    "id": "course-002",
    "name": "人工智能基础",
    "teacher": "张教授",
    "description": "AI课程介绍",
    "totalChapters": 12,
    "createdAt": "2024-11-28T10:00:00Z"
  }
}
```

#### **更新课程**
```
PUT /api/admin/courses/{courseId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "name": "人工智能基础（更新）",
  "description": "更新后的描述"
}
```

#### **删除课程**
```
DELETE /api/admin/courses/{courseId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "message": "课程删除成功"
}
```

---

### **3. 作业管理**

#### **创建作业**
```
POST /api/admin/homework
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "courseId": "course-001",
  "title": "第二章课后习题",
  "chapter": 2,
  "deadline": "2024-12-31T23:59:59Z",
  "totalScore": 100,
  "description": "完成第11-20题"
}
```

#### **更新作业**
```
PUT /api/admin/homework/{courseId}/{homeworkId}
Headers: Authorization: Bearer {token}
```

#### **删除作业**
```
DELETE /api/admin/homework/{courseId}/{homeworkId}
Headers: Authorization: Bearer {token}
```

#### **获取作业所有提交**
```
GET /api/admin/submissions/{homeworkId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "sub-001",
      "student": {
        "id": "student-001",
        "name": "张三",
        "studentId": "2021001"
      },
      "content": "作业答案...",
      "submittedAt": "2024-11-20T10:00:00Z",
      "status": "submitted"
    }
  ]
}
```

#### **批改作业**
```
PUT /api/admin/submissions/{submissionId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "score": 85,
  "feedback": "完成良好，第3题有误"
}
```

---

### **4. 学生管理**

#### **获取所有学生**
```
GET /api/admin/students
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": "student-001",
      "username": "zhangsan",
      "name": "张三",
      "studentId": "2021001",
      "email": "zhangsan@suat.edu.cn",
      "major": "计算机科学与技术",
      "class": "21计科1班"
    }
  ]
}
```

#### **添加学生**
```
POST /api/admin/students
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "username": "lisi",
  "password": "123456",
  "name": "李四",
  "studentId": "2021002",
  "email": "lisi@suat.edu.cn",
  "major": "软件工程",
  "class": "21软工1班"
}
```

#### **更新学生信息**
```
PUT /api/admin/students/{studentId}
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "email": "newemail@suat.edu.cn",
  "major": "人工智能"
}
```

#### **删除学生**
```
DELETE /api/admin/students/{studentId}
Headers: Authorization: Bearer {token}
```

#### **重置学生密码**
```
POST /api/admin/students/{studentId}/reset-password
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "newPassword": "123456"
}
```

#### **获取学生详情（含学习数据）**
```
GET /api/admin/students/{studentId}
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "student": {
    "id": "student-001",
    "name": "张三",
    "studentId": "2021001",
    "email": "zhangsan@suat.edu.cn",
    "major": "计算机科学与技术",
    "class": "21计科1班",
    "stats": {
      "enrolledCourses": 3,
      "completedHomework": 15,
      "avgScore": 85.5
    }
  }
}
```

---

### **5. 通知推送**

#### **发送通知给指定学生**
```
POST /api/admin/notifications
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "userId": "student-001",
  "type": "system",
  "title": "通知标题",
  "message": "通知内容",
  "category": "系统通知"
}
```

#### **广播通知给所有学生**
```
POST /api/admin/notifications/broadcast
Headers: Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "type": "system",
  "title": "全体通知",
  "message": "周末进行期中考试",
  "category": "考试通知"
}
```

---

### **6. 数据统计**

#### **获取系统统计数据**
```
GET /api/admin/analytics
Headers: Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalStudents": 150,
    "totalCourses": 10,
    "totalHomework": 50,
    "pendingSubmissions": 20,
    "recentActivities": [
      {
        "type": "submission",
        "student": "张三",
        "action": "提交了作业",
        "time": "2024-11-28T10:00:00Z"
      }
    ]
  }
}
```

---

## ⚙️ CORS 配置

### **Spring Boot CORS 配置**
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")  // 生产环境请修改为具体域名
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .exposedHeaders("Authorization")
                    .allowCredentials(false)
                    .maxAge(3600);
            }
        };
    }
}
```

---

## 🚀 快速开始

### **1. 创建数据库**
```sql
CREATE DATABASE suat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE suat_db;

-- 执行上面的所有建表语句
```

### **2. 配置 application.properties**
```properties
# 服务器配置
server.port=8080

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/suat_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT 配置
jwt.secret=your-secret-key-here-change-in-production
jwt.expiration=86400000
```

### **3. 插入初始数据**
```sql
-- 插入教师账号
INSERT INTO teachers (id, username, password, name, email, role) VALUES
('teacher-001', 'admin@suat.edu.cn', '$2a$10$...', '管理员', 'admin@suat.edu.cn', 'teacher');

-- 插入学生账号
INSERT INTO students (id, username, password, name, student_id, email, major, class_name) VALUES
('student-001', 'zhangsan', '$2a$10$...', '张三', '2021001', 'zhangsan@suat.edu.cn', '计算机科学与技术', '21计科1班'),
('student-002', 'lisi', '$2a$10$...', '李四', '2021002', 'lisi@suat.edu.cn', '软件工程', '21软工1班');

-- 插入课程
INSERT INTO courses (id, name, teacher, description, total_chapters) VALUES
('course-001', '高等数学', '王教授', '高等数学基础课程', 10),
('course-002', '大学物理', '李教授', '大学物理基础课程', 8);
```

### **4. 启动项目**
```bash
# Maven
mvn spring-boot:run

# Gradle
./gradlew bootRun

# 或直接运行主类
java -jar target/suat-backend-0.0.1-SNAPSHOT.jar
```

### **5. 测试API**
```bash
# 测试健康检查
curl http://localhost:8080/api/health

# 测试学生登录
curl -X POST http://localhost:8080/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"123456"}'
```

---

## 📝 实体类示例

### **Student.java**
```java
@Entity
@Table(name = "students")
public class Student {
    @Id
    private String id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;
    
    private String email;
    private String major;
    
    @Column(name = "class_name")
    private String className;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}
```

---

## 🔒 密码加密

### **使用 BCrypt**
```java
@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    
    public String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }
    
    public boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

---

## ✅ 总结

这份文档提供了完整的 Java 后端 API 规范，您可以：

1. ✅ 使用 Spring Boot 实现所有接口
2. ✅ 使用 MySQL/PostgreSQL 存储数据
3. ✅ 使用 JWT 实现认证
4. ✅ 完整支持学生端和教师端功能
5. ✅ 前端已配置好可以直接对接

**前端配置文件在：`/config/backend.config.ts`**

修改 `JAVA_BACKEND_CONFIG.baseUrl` 为您的后端地址即可！

---

**开发愉快！** 🚀
