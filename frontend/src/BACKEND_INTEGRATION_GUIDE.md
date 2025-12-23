# 🚀 后端对接完整指南

## 📋 目录
1. [开发顺序建议](#开发顺序建议)
2. [后端需要实现的接口](#后端需要实现的接口)
3. [数据库表结构](#数据库表结构)
4. [前端对接位置](#前端对接位置)
5. [配置说明](#配置说明)

---

## 🎯 开发顺序建议

### ✅ 推荐：先做后端，再对接前端

**原因：**
1. **数据结构驱动** - 后端定义了数据库表结构和API规范
2. **接口规范先行** - 前端需要知道请求/响应格式才能对接
3. **并行开发** - 前端可以先用Mock数据开发，后端完成后再切换
4. **类型安全** - Java的强类型特性，前端可以根据后端接口定义TypeScript类型

### 📅 开发流程建议

```
第1阶段（2-3天）：后端框架搭建
├── 搭建Spring Boot项目
├── 配置MySQL数据库
├── 创建数据库表
└── 实现基础CRUD

第2阶段（2-3天）：核心接口开发
├── 认证系统（学生/教师登录）
├── 学生端接口（课程、作业、通知）
└── 教师端接口（学生管理、课程管理）

第3阶段（1-2天）：前端对接
├── 修改前端API配置
├── 测试所有接口
└── 修复bug

第4阶段（1天）：完善与优化
├── 添加日志
├── 异常处理
└── 性能优化
```

---

## 🔌 后端需要实现的接口清单

### 1️⃣ 认证相关 `/api/auth`

#### 1.1 学生登录
```
POST /api/auth/student/login
Request:
{
  "studentId": "2023001",
  "password": "123456"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "studentId": "2023001",
    "name": "张三",
    "major": "计算机科学与技术",
    "grade": "2023级"
  }
}
```

**前端对接位置：** `/components/StudentLogin.tsx`（待添加）

---

#### 1.2 教师登录
```
POST /api/auth/teacher/login
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "name": "王老师",
    "department": "计算机学院"
  }
}
```

**前端对接位置：** `/components/AdminLogin.tsx` ✅ 已完成

---

### 2️⃣ 学生端接口 `/api/student`

#### 2.1 获取学生个人信息
```
GET /api/student/profile
Headers: Authorization: Bearer {token}

Response:
{
  "id": "1",
  "studentId": "2023001",
  "name": "张三",
  "major": "计算机科学与技术",
  "grade": "2023级",
  "email": "zhangsan@suat.edu.cn",
  "phone": "138****1234",
  "credits": 45,
  "gpa": 3.75
}
```

**前端对接位置：** `/components/PersonalCenter.tsx` ✅ 已完成

---

#### 2.2 获取学生课程列表
```
GET /api/student/courses
Headers: Authorization: Bearer {token}

Response:
[
  {
    "id": "1",
    "name": "Java程序设计",
    "teacher": "李老师",
    "credits": 4,
    "schedule": "周一 1-2节, 周三 3-4节",
    "classroom": "教学楼A101",
    "progress": 75
  },
  ...
]
```

**前端对接位置：** `/components/LearningCenter.tsx` ✅ 已完成

---

#### 2.3 获取学生通知列表
```
GET /api/student/notifications
Headers: Authorization: Bearer {token}

Response:
[
  {
    "id": "1",
    "type": "deadline",  // deadline, grade, announcement, system
    "title": "Java作业即将截止",
    "content": "Java程序设计第三章作业将在明天23:59截止",
    "time": "2025-11-29T10:00:00Z",
    "read": false,
    "priority": "high"  // high, normal, low
  },
  ...
]
```

**前端对接位置：** `/components/NotificationCenter.tsx` ✅ 已完成

---

#### 2.4 标记通知为已读
```
PUT /api/student/notifications/{id}/read
Headers: Authorization: Bearer {token}

Response:
{
  "success": true
}
```

**前端对接位置：** `/components/NotificationCenter.tsx` ✅ 已完成

---

### 3️⃣ 课程详情接口 `/api/courses`

#### 3.1 获取课程详情
```
GET /api/courses/{id}
Headers: Authorization: Bearer {token}

Response:
{
  "id": "1",
  "name": "Java程序设计",
  "teacher": "李老师",
  "credits": 4,
  "description": "本课程介绍Java编程语言...",
  "schedule": "周一 1-2节, 周三 3-4节",
  "classroom": "教学楼A101"
}
```

**前端对接位置：** `/components/CourseDetail.tsx`

---

#### 3.2 获取课程章节列表
```
GET /api/courses/{id}/chapters

Response:
[
  {
    "id": "1",
    "title": "第一章 Java基础",
    "sections": [
      "1.1 Java简介",
      "1.2 开发环境搭建",
      "1.3 第一个Java程序"
    ]
  },
  ...
]
```

**前端对接位置：** `/components/TextbookReader.tsx`

---

#### 3.3 获取课程作业列表
```
GET /api/courses/{id}/homework

Response:
[
  {
    "id": "1",
    "title": "第三章编程练习",
    "description": "完成以下编程题目...",
    "dueDate": "2025-12-01T23:59:59Z",
    "status": "pending",  // pending, submitted, graded
    "score": null
  },
  ...
]
```

**前端对接位置：** `/components/HomeworkSection.tsx`

---

#### 3.4 提交作业
```
POST /api/courses/{courseId}/homework/{homeworkId}/submit
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
{
  "content": "作业内容...",
  "attachments": [File]  // 可选
}

Response:
{
  "success": true,
  "submissionId": "123"
}
```

**前端对接位置：** `/components/HomeworkSection.tsx`

---

### 4️⃣ AI聊天接口 `/api/ai`

#### 4.1 获取聊天历史
```
GET /api/ai/chat/history
Headers: Authorization: Bearer {token}

Response:
[
  {
    "id": "1",
    "role": "user",
    "content": "什么是Java？",
    "timestamp": "2025-11-29T10:00:00Z"
  },
  {
    "id": "2",
    "role": "assistant",
    "content": "Java是一种面向对象的编程语言...",
    "timestamp": "2025-11-29T10:00:05Z"
  }
]
```

**前端对接位置：** `/components/AIChat.tsx` ✅ 已完成

---

#### 4.2 保存聊天消息
```
POST /api/ai/chat
Headers: Authorization: Bearer {token}

Request:
{
  "role": "user",
  "content": "什么是Java？"
}

Response:
{
  "success": true,
  "messageId": "123"
}
```

**前端对接位置：** `/components/AIChat.tsx` ✅ 已完成

**注意：** AI实际的对话逻辑在前端直接调用AI服务（内网），这个接口只是保存聊天记录到数据库。

---

### 5️⃣ 教师管理接口 `/api/admin`

#### 5.1 获取学生列表
```
GET /api/admin/students
Headers: Authorization: Bearer {teacherToken}

Response:
[
  {
    "id": "1",
    "studentId": "2023001",
    "name": "张三",
    "major": "计算机科学与技术",
    "grade": "2023级",
    "email": "zhangsan@suat.edu.cn",
    "phone": "138****1234"
  },
  ...
]
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 学生管理标签页

---

#### 5.2 创建学生账号
```
POST /api/admin/students
Headers: Authorization: Bearer {teacherToken}

Request:
{
  "studentId": "2023099",
  "name": "新学生",
  "password": "123456",  // 默认密码
  "major": "软件工程",
  "grade": "2023级",
  "email": "newstudent@suat.edu.cn",
  "phone": "139****9999"
}

Response:
{
  "success": true,
  "id": "99"
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 添加学生对话框

---

#### 5.3 更新学生信息
```
PUT /api/admin/students/{id}
Headers: Authorization: Bearer {teacherToken}

Request:
{
  "name": "张三",
  "email": "newemail@suat.edu.cn",
  "phone": "138****0000"
}

Response:
{
  "success": true
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 编辑学生功能

---

#### 5.4 删除学生账号
```
DELETE /api/admin/students/{id}
Headers: Authorization: Bearer {teacherToken}

Response:
{
  "success": true
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 删除学生功能

---

#### 5.5 获取课程列表（教师端）
```
GET /api/admin/courses
Headers: Authorization: Bearer {teacherToken}

Response:
[
  {
    "id": "1",
    "name": "Java程序设计",
    "teacher": "李老师",
    "credits": 4,
    "students": 45  // 选课学生数
  },
  ...
]
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 课程管理标签页

---

#### 5.6 创建课程
```
POST /api/admin/courses
Headers: Authorization: Bearer {teacherToken}

Request:
{
  "name": "新课程",
  "teacher": "王老师",
  "credits": 3,
  "description": "课程描述",
  "schedule": "周二 3-4节",
  "classroom": "A201"
}

Response:
{
  "success": true,
  "id": "10"
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 添加课程功能

---

#### 5.7 删除课程
```
DELETE /api/admin/courses/{id}
Headers: Authorization: Bearer {teacherToken}

Response:
{
  "success": true
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 删除课程功能

---

#### 5.8 创建作业
```
POST /api/admin/homework
Headers: Authorization: Bearer {teacherToken}

Request:
{
  "courseId": "1",
  "title": "第三章编程练习",
  "description": "完成以下题目...",
  "dueDate": "2025-12-01T23:59:59Z",
  "totalScore": 100
}

Response:
{
  "success": true,
  "id": "20"
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 作业管理标签页

---

#### 5.9 广播通知
```
POST /api/admin/notifications/broadcast
Headers: Authorization: Bearer {teacherToken}

Request:
{
  "title": "通知标题",
  "content": "通知内容",
  "type": "announcement",
  "priority": "normal",
  "targetStudents": []  // 空数组表示全体学生
}

Response:
{
  "success": true,
  "sentCount": 156  // 发送数量
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 通知推送标签页

---

#### 5.10 获取统计数据
```
GET /api/admin/analytics
Headers: Authorization: Bearer {teacherToken}

Response:
{
  "totalStudents": 156,
  "totalCourses": 12,
  "activeStudents": 142,
  "pendingHomework": 23,
  "courseCompletion": 67.5,
  "avgGpa": 3.45
}
```

**前端对接位置：** `/components/AdminDashboard.tsx` - 首页统计卡片

---

## 🗄️ 数据库表结构

### 1. students 表 - 学生信息
```sql
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    major VARCHAR(100) COMMENT '专业',
    grade VARCHAR(20) COMMENT '年级',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    enrollment_year INT COMMENT '入学年份',
    credits INT DEFAULT 0 COMMENT '学分',
    gpa DECIMAL(3,2) COMMENT 'GPA',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id)
);
```

### 2. teachers 表 - 教师信息
```sql
CREATE TABLE teachers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    department VARCHAR(100) COMMENT '院系',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. courses 表 - 课程信息
```sql
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '课程名称',
    teacher_id BIGINT COMMENT '教师ID',
    teacher_name VARCHAR(50) COMMENT '教师姓名',
    credits INT COMMENT '学分',
    description TEXT COMMENT '课程描述',
    schedule VARCHAR(100) COMMENT '上课时间',
    classroom VARCHAR(50) COMMENT '教室',
    image_url VARCHAR(255) COMMENT '课程图片',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);
```

### 4. student_courses 表 - 学生选课关系
```sql
CREATE TABLE student_courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    progress INT DEFAULT 0 COMMENT '学习进度（0-100）',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_course (student_id, course_id)
);
```

### 5. homework 表 - 作业信息
```sql
CREATE TABLE homework (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL COMMENT '作业标题',
    description TEXT COMMENT '作业描述',
    due_date TIMESTAMP COMMENT '截止时间',
    total_score INT DEFAULT 100 COMMENT '总分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### 6. homework_submissions 表 - 作业提交
```sql
CREATE TABLE homework_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    homework_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    content TEXT COMMENT '作业内容',
    attachments JSON COMMENT '附件列表',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending, submitted, graded',
    score INT COMMENT '得分',
    feedback TEXT COMMENT '教师反馈',
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uk_homework_student (homework_id, student_id)
);
```

### 7. notifications 表 - 通知信息
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT '类型：deadline, grade, announcement, system',
    title VARCHAR(200) NOT NULL,
    content TEXT,
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级：high, normal, low',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_read (student_id, is_read),
    INDEX idx_created_at (created_at)
);
```

### 8. chapters 表 - 课程章节
```sql
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    sections JSON COMMENT '小节列表',
    content TEXT COMMENT '章节内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_course_chapter (course_id, chapter_number)
);
```

### 9. chat_history 表 - AI聊天记录
```sql
CREATE TABLE chat_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'user 或 assistant',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_time (student_id, created_at)
);
```

---

## 🔧 前端配置说明

### 1. 修改API基础地址

编辑 `/utils/api-config.ts` 文件：

```typescript
export const API_CONFIG = {
  // 修改为你的Java后端地址
  BASE_URL: 'http://localhost:8080/api',  // 开发环境
  // BASE_URL: 'http://your-server.com/api',  // 生产环境
  
  // 关闭Mock数据，使用真实后端
  USE_MOCK_DATA: false,  // 改为 false
};
```

### 2. 环境变量配置（可选）

创建 `.env` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

---

## ✅ 前端已完成的对接

以下组件已经完成API调用的改造：

- ✅ `/components/AIChat.tsx` - AI聊天
- ✅ `/components/LearningCenter.tsx` - 学习中心
- ✅ `/components/NotificationCenter.tsx` - 通知中心
- ✅ `/components/PersonalCenter.tsx` - 个人中心
- ✅ `/components/AdminLogin.tsx` - 教师登录
- ✅ `/utils/api-new.ts` - 所有API调用封装

---

## 🔄 对接流程

### 第1步：后端实现接口
1. 按照上面的接口清单实现所有API
2. 确保返回的JSON格式与文档一致
3. 实现JWT认证

### 第2步：测试后端接口
使用Postman或其他工具测试所有接口

### 第3步：前端配置
1. 修改 `/utils/api-config.ts` 中的 `BASE_URL`
2. 将 `USE_MOCK_DATA` 改为 `false`

### 第4步：联调测试
1. 启动Java后端
2. 启动前端应用
3. 测试所有功能

---

## 🐛 常见问题

### Q1: CORS跨域问题
**后端需要配置CORS：**

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000");  // 前端地址
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### Q2: JWT认证
前端会在请求头中携带token：
```
Authorization: Bearer {token}
```

后端需要验证token并提取用户信息。

### Q3: 文件上传
作业提交接口需要支持multipart/form-data格式。

---

## 📞 联系与支持

如果在对接过程中遇到问题：
1. 查看浏览器控制台（F12）的错误信息
2. 查看后端日志
3. 使用前端的网络诊断工具（右下角绿色按钮）

---

**最后更新：** 2025-11-29
**文档版本：** 1.0
