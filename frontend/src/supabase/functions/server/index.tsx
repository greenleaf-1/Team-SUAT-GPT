import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4896d9cd/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== Courses API =====
// Get all courses
app.get("/make-server-4896d9cd/courses", async (c) => {
  try {
    const courses = await kv.getByPrefix("course:");
    return c.json({ courses: courses || [] });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return c.json({ error: "Failed to fetch courses", details: String(error) }, 500);
  }
});

// Get course by ID
app.get("/make-server-4896d9cd/courses/:id", async (c) => {
  try {
    const courseId = c.req.param("id");
    const course = await kv.get(`course:${courseId}`);
    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }
    return c.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    return c.json({ error: "Failed to fetch course", details: String(error) }, 500);
  }
});

// Initialize demo courses
app.post("/make-server-4896d9cd/init-courses", async (c) => {
  try {
    const demoCourses = [
      {
        id: "course1",
        name: "高等数学",
        teacher: "张教授",
        progress: 65,
        totalChapters: 12,
        completedChapters: 8,
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
        description: "高等数学是工科专业的重要基础课程，包括微积分、线性代数等内容。",
        chapters: [
          { id: 1, title: "第一章 函数与极限", sections: 8, completed: true },
          { id: 2, title: "第二章 导数与微分", sections: 6, completed: true },
          { id: 3, title: "第三章 微分中值定理", sections: 5, completed: false },
          { id: 4, title: "第四章 不定积分", sections: 7, completed: false }
        ]
      },
      {
        id: "course2",
        name: "大学物理",
        teacher: "李教授",
        progress: 45,
        totalChapters: 10,
        completedChapters: 5,
        coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400",
        description: "大学物理涵盖力学、热学、电磁学、光学和近代物理等内容。",
        chapters: [
          { id: 1, title: "第一章 质点运动学", sections: 6, completed: true },
          { id: 2, title: "第二章 牛顿运动定律", sections: 5, completed: true },
          { id: 3, title: "第三章 动量守恒定律", sections: 4, completed: false },
          { id: 4, title: "第四章 机械能守恒定律", sections: 6, completed: false }
        ]
      },
      {
        id: "course3",
        name: "程序设计基础",
        teacher: "王教授",
        progress: 80,
        totalChapters: 8,
        completedChapters: 6,
        coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
        description: "学习计算机编程的基础知识，包括算法、数据结构和程序设计方法。",
        chapters: [
          { id: 1, title: "第一章 程序设计入门", sections: 5, completed: true },
          { id: 2, title: "第二章 数据类型与运算", sections: 6, completed: true },
          { id: 3, title: "第三章 控制结构", sections: 7, completed: true },
          { id: 4, title: "第四章 函数与模块", sections: 5, completed: false }
        ]
      }
    ];

    for (const course of demoCourses) {
      await kv.set(`course:${course.id}`, course);
    }

    return c.json({ message: "Demo courses initialized successfully", count: demoCourses.length });
  } catch (error) {
    console.error("Error initializing courses:", error);
    return c.json({ error: "Failed to initialize courses", details: String(error) }, 500);
  }
});

// ===== User Progress API =====
// Get user progress for a course
app.get("/make-server-4896d9cd/progress/:userId/:courseId", async (c) => {
  try {
    const { userId, courseId } = c.req.param();
    const progress = await kv.get(`progress:${userId}:${courseId}`);
    return c.json({ progress: progress || { currentChapter: 1, currentSection: 1, percentage: 0 } });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return c.json({ error: "Failed to fetch progress", details: String(error) }, 500);
  }
});

// Update user progress
app.post("/make-server-4896d9cd/progress/:userId/:courseId", async (c) => {
  try {
    const { userId, courseId } = c.req.param();
    const progressData = await c.req.json();
    await kv.set(`progress:${userId}:${courseId}`, progressData);
    return c.json({ message: "Progress updated successfully", progress: progressData });
  } catch (error) {
    console.error("Error updating progress:", error);
    return c.json({ error: "Failed to update progress", details: String(error) }, 500);
  }
});

// ===== Bookmarks API =====
// Get bookmarks for a course
app.get("/make-server-4896d9cd/bookmarks/:userId/:courseId", async (c) => {
  try {
    const { userId, courseId } = c.req.param();
    const bookmarks = await kv.get(`bookmarks:${userId}:${courseId}`);
    return c.json({ bookmarks: bookmarks || [] });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return c.json({ error: "Failed to fetch bookmarks", details: String(error) }, 500);
  }
});

// Add bookmark
app.post("/make-server-4896d9cd/bookmarks/:userId/:courseId", async (c) => {
  try {
    const { userId, courseId } = c.req.param();
    const newBookmark = await c.req.json();
    const bookmarks = await kv.get(`bookmarks:${userId}:${courseId}`) || [];
    bookmarks.push({ ...newBookmark, id: Date.now().toString(), createdAt: new Date().toISOString() });
    await kv.set(`bookmarks:${userId}:${courseId}`, bookmarks);
    return c.json({ message: "Bookmark added successfully", bookmarks });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return c.json({ error: "Failed to add bookmark", details: String(error) }, 500);
  }
});

// Delete bookmark
app.delete("/make-server-4896d9cd/bookmarks/:userId/:courseId/:bookmarkId", async (c) => {
  try {
    const { userId, courseId, bookmarkId } = c.req.param();
    const bookmarks = await kv.get(`bookmarks:${userId}:${courseId}`) || [];
    const filtered = bookmarks.filter((b: any) => b.id !== bookmarkId);
    await kv.set(`bookmarks:${userId}:${courseId}`, filtered);
    return c.json({ message: "Bookmark deleted successfully", bookmarks: filtered });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return c.json({ error: "Failed to delete bookmark", details: String(error) }, 500);
  }
});

// ===== Notes API =====
// Get notes for a course
app.get("/make-server-4896d9cd/notes/:userId/:courseId", async (c) => {
  try {
    const { userId, courseId } = c.req.param();
    const notes = await kv.get(`notes:${userId}:${courseId}`);
    return c.json({ notes: notes || [] });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return c.json({ error: "Failed to fetch notes", details: String(error) }, 500);
  }
});

// Add note
app.post("/make-server-4896d9cd/notes/:userId/:courseId", async (c) => {
  try {
    const { userId, courseId } = c.req.param();
    const newNote = await c.req.json();
    const notes = await kv.get(`notes:${userId}:${courseId}`) || [];
    notes.push({ ...newNote, id: Date.now().toString(), createdAt: new Date().toISOString() });
    await kv.set(`notes:${userId}:${courseId}`, notes);
    return c.json({ message: "Note added successfully", notes });
  } catch (error) {
    console.error("Error adding note:", error);
    return c.json({ error: "Failed to add note", details: String(error) }, 500);
  }
});

// Update note
app.put("/make-server-4896d9cd/notes/:userId/:courseId/:noteId", async (c) => {
  try {
    const { userId, courseId, noteId } = c.req.param();
    const updatedNote = await c.req.json();
    const notes = await kv.get(`notes:${userId}:${courseId}`) || [];
    const index = notes.findIndex((n: any) => n.id === noteId);
    if (index >= 0) {
      notes[index] = { ...notes[index], ...updatedNote, updatedAt: new Date().toISOString() };
      await kv.set(`notes:${userId}:${courseId}`, notes);
      return c.json({ message: "Note updated successfully", notes });
    }
    return c.json({ error: "Note not found" }, 404);
  } catch (error) {
    console.error("Error updating note:", error);
    return c.json({ error: "Failed to update note", details: String(error) }, 500);
  }
});

// Delete note
app.delete("/make-server-4896d9cd/notes/:userId/:courseId/:noteId", async (c) => {
  try {
    const { userId, courseId, noteId } = c.req.param();
    const notes = await kv.get(`notes:${userId}:${courseId}`) || [];
    const filtered = notes.filter((n: any) => n.id !== noteId);
    await kv.set(`notes:${userId}:${courseId}`, filtered);
    return c.json({ message: "Note deleted successfully", notes: filtered });
  } catch (error) {
    console.error("Error deleting note:", error);
    return c.json({ error: "Failed to delete note", details: String(error) }, 500);
  }
});

// ===== Homework API =====
// Get homework for a course
app.get("/make-server-4896d9cd/homework/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId");
    const homework = await kv.getByPrefix(`homework:${courseId}:`);
    return c.json({ homework: homework || [] });
  } catch (error) {
    console.error("Error fetching homework:", error);
    return c.json({ error: "Failed to fetch homework", details: String(error) }, 500);
  }
});

// Get homework submission
app.get("/make-server-4896d9cd/submissions/:userId/:homeworkId", async (c) => {
  try {
    const { userId, homeworkId } = c.req.param();
    const submission = await kv.get(`submission:${userId}:${homeworkId}`);
    return c.json({ submission: submission || null });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return c.json({ error: "Failed to fetch submission", details: String(error) }, 500);
  }
});

// Submit homework
app.post("/make-server-4896d9cd/submissions/:userId/:homeworkId", async (c) => {
  try {
    const { userId, homeworkId } = c.req.param();
    const submissionData = await c.req.json();
    const submission = {
      ...submissionData,
      submittedAt: new Date().toISOString(),
      status: "submitted"
    };
    await kv.set(`submission:${userId}:${homeworkId}`, submission);
    return c.json({ message: "Homework submitted successfully", submission });
  } catch (error) {
    console.error("Error submitting homework:", error);
    return c.json({ error: "Failed to submit homework", details: String(error) }, 500);
  }
});

// Initialize demo homework
app.post("/make-server-4896d9cd/init-homework", async (c) => {
  try {
    const demoHomework = [
      {
        id: "hw1",
        courseId: "course1",
        title: "第一章习题",
        chapter: 1,
        deadline: "2025-12-05",
        status: "completed",
        score: 95,
        totalScore: 100
      },
      {
        id: "hw2",
        courseId: "course1",
        title: "第二章习题",
        chapter: 2,
        deadline: "2025-12-10",
        status: "graded",
        score: 88,
        totalScore: 100
      },
      {
        id: "hw3",
        courseId: "course1",
        title: "第三章习题",
        chapter: 3,
        deadline: "2025-12-15",
        status: "pending",
        score: null,
        totalScore: 100
      }
    ];

    for (const hw of demoHomework) {
      await kv.set(`homework:${hw.courseId}:${hw.id}`, hw);
    }

    return c.json({ message: "Demo homework initialized successfully", count: demoHomework.length });
  } catch (error) {
    console.error("Error initializing homework:", error);
    return c.json({ error: "Failed to initialize homework", details: String(error) }, 500);
  }
});

// ===== Notifications API =====
// Get notifications for user
app.get("/make-server-4896d9cd/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    return c.json({ notifications: notifications || [] });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ error: "Failed to fetch notifications", details: String(error) }, 500);
  }
});

// Mark notification as read
app.put("/make-server-4896d9cd/notifications/:userId/:notificationId", async (c) => {
  try {
    const { userId, notificationId } = c.req.param();
    const notification = await kv.get(`notification:${userId}:${notificationId}`);
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }
    notification.read = true;
    await kv.set(`notification:${userId}:${notificationId}`, notification);
    return c.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return c.json({ error: "Failed to update notification", details: String(error) }, 500);
  }
});

// Initialize demo notifications
app.post("/make-server-4896d9cd/init-notifications", async (c) => {
  try {
    const userId = "demo-user";
    const demoNotifications = [
      {
        id: "notif1",
        type: "homework",
        title: "作业批改完成",
        message: "您的《高等数学》第二章作业已批改完成，得分88分",
        time: "2小时前",
        read: false,
        category: "作业通知"
      },
      {
        id: "notif2",
        type: "course",
        title: "新课程上线",
        message: "《数据结构与算法》课程已上线，快来学习吧！",
        time: "5小时前",
        read: false,
        category: "课程通知"
      },
      {
        id: "notif3",
        type: "system",
        title: "系统维护通知",
        message: "系统将于本周六凌晨2:00-4:00进行维护升级",
        time: "1天前",
        read: true,
        category: "系统通知"
      },
      {
        id: "notif4",
        type: "exam",
        title: "考试安排通知",
        message: "《大学物理》期末考试时间已确定：12月28日上午9:00-11:00",
        time: "2天前",
        read: false,
        category: "考试通知"
      }
    ];

    for (const notif of demoNotifications) {
      await kv.set(`notification:${userId}:${notif.id}`, notif);
    }

    return c.json({ message: "Demo notifications initialized successfully", count: demoNotifications.length });
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return c.json({ error: "Failed to initialize notifications", details: String(error) }, 500);
  }
});

// ===== User Profile API =====
// Get user profile
app.get("/make-server-4896d9cd/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      // Return default profile
      const defaultProfile = {
        name: "张同学",
        studentId: "2021001234",
        major: "计算机科学与技术",
        class: "计科2101班",
        email: "zhangxuesheng@suat.edu.cn",
        phone: "138****5678",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        stats: {
          totalCourses: 6,
          completedCourses: 2,
          totalHours: 128,
          averageScore: 87.5
        }
      };
      return c.json({ profile: defaultProfile });
    }
    return c.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile", details: String(error) }, 500);
  }
});

// Update user profile
app.put("/make-server-4896d9cd/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const profileData = await c.req.json();
    await kv.set(`profile:${userId}`, profileData);
    return c.json({ message: "Profile updated successfully", profile: profileData });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ error: "Failed to update profile", details: String(error) }, 500);
  }
});

// ===== Chat History API =====
// Get chat history
app.get("/make-server-4896d9cd/chat/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const chatHistory = await kv.get(`chat:${userId}`);
    return c.json({ messages: chatHistory || [] });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return c.json({ error: "Failed to fetch chat history", details: String(error) }, 500);
  }
});

// Save chat message
app.post("/make-server-4896d9cd/chat/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const message = await c.req.json();
    const chatHistory = await kv.get(`chat:${userId}`) || [];
    chatHistory.push({ ...message, timestamp: new Date().toISOString() });
    await kv.set(`chat:${userId}`, chatHistory);
    return c.json({ message: "Message saved successfully", chatHistory });
  } catch (error) {
    console.error("Error saving chat message:", error);
    return c.json({ error: "Failed to save chat message", details: String(error) }, 500);
  }
});

// Clear chat history
app.delete("/make-server-4896d9cd/chat/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    await kv.set(`chat:${userId}`, []);
    return c.json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return c.json({ error: "Failed to clear chat history", details: String(error) }, 500);
  }
});

// ===== ADMIN/TEACHER MANAGEMENT API =====

// Teacher login (simple auth without Supabase Auth for quick setup)
app.post("/make-server-4896d9cd/admin/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const teacher = await kv.get(`teacher:${username}`);
    
    if (!teacher || teacher.password !== password) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    // Return teacher info without password
    const { password: _, ...teacherInfo } = teacher;
    return c.json({ 
      success: true, 
      teacher: teacherInfo,
      token: `teacher_${username}_${Date.now()}` // Simple token
    });
  } catch (error) {
    console.error("Error during teacher login:", error);
    return c.json({ error: "Login failed", details: String(error) }, 500);
  }
});

// Initialize default teacher account
app.post("/make-server-4896d9cd/admin/init-teacher", async (c) => {
  try {
    const defaultTeacher = {
      username: "teacher",
      password: "teacher123", // In production, use proper password hashing
      name: "王老师",
      email: "teacher@suat.edu.cn",
      phone: "138****1234",
      role: "teacher",
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`teacher:${defaultTeacher.username}`, defaultTeacher);
    return c.json({ message: "Default teacher account created (username: teacher, password: teacher123)" });
  } catch (error) {
    console.error("Error initializing teacher:", error);
    return c.json({ error: "Failed to initialize teacher", details: String(error) }, 500);
  }
});

// Create new course (Teacher only)
app.post("/make-server-4896d9cd/admin/courses", async (c) => {
  try {
    const courseData = await c.req.json();
    const courseId = `course-${Date.now()}`;
    const newCourse = {
      ...courseData,
      id: courseId,
      createdAt: new Date().toISOString(),
      progress: 0,
      completedChapters: 0
    };
    
    await kv.set(`course:${courseId}`, newCourse);
    return c.json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    return c.json({ error: "Failed to create course", details: String(error) }, 500);
  }
});

// Update course (Teacher only)
app.put("/make-server-4896d9cd/admin/courses/:id", async (c) => {
  try {
    const courseId = c.req.param("id");
    const updates = await c.req.json();
    const course = await kv.get(`course:${courseId}`);
    
    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }
    
    const updatedCourse = { ...course, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`course:${courseId}`, updatedCourse);
    return c.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    return c.json({ error: "Failed to update course", details: String(error) }, 500);
  }
});

// Delete course (Teacher only)
app.delete("/make-server-4896d9cd/admin/courses/:id", async (c) => {
  try {
    const courseId = c.req.param("id");
    await kv.del(`course:${courseId}`);
    return c.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return c.json({ error: "Failed to delete course", details: String(error) }, 500);
  }
});

// Create homework assignment (Teacher only)
app.post("/make-server-4896d9cd/admin/homework", async (c) => {
  try {
    const homeworkData = await c.req.json();
    const hwId = `hw-${Date.now()}`;
    const newHomework = {
      ...homeworkData,
      id: hwId,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    await kv.set(`homework:${homeworkData.courseId}:${hwId}`, newHomework);
    return c.json({ message: "Homework created successfully", homework: newHomework });
  } catch (error) {
    console.error("Error creating homework:", error);
    return c.json({ error: "Failed to create homework", details: String(error) }, 500);
  }
});

// Update homework (Teacher only)
app.put("/make-server-4896d9cd/admin/homework/:courseId/:id", async (c) => {
  try {
    const { courseId, id } = c.req.param();
    const updates = await c.req.json();
    const homework = await kv.get(`homework:${courseId}:${id}`);
    
    if (!homework) {
      return c.json({ error: "Homework not found" }, 404);
    }
    
    const updatedHomework = { ...homework, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`homework:${courseId}:${id}`, updatedHomework);
    return c.json({ message: "Homework updated successfully", homework: updatedHomework });
  } catch (error) {
    console.error("Error updating homework:", error);
    return c.json({ error: "Failed to update homework", details: String(error) }, 500);
  }
});

// Delete homework (Teacher only)
app.delete("/make-server-4896d9cd/admin/homework/:courseId/:id", async (c) => {
  try {
    const { courseId, id } = c.req.param();
    await kv.del(`homework:${courseId}:${id}`);
    return c.json({ message: "Homework deleted successfully" });
  } catch (error) {
    console.error("Error deleting homework:", error);
    return c.json({ error: "Failed to delete homework", details: String(error) }, 500);
  }
});

// Get all submissions for a homework (Teacher only)
app.get("/make-server-4896d9cd/admin/submissions/:homeworkId", async (c) => {
  try {
    const homeworkId = c.req.param("homeworkId");
    const submissions = await kv.getByPrefix(`submission:`);
    
    // Filter submissions for this homework
    const hwSubmissions = submissions.filter((s: any) => {
      const key = Object.keys(s)[0];
      return key.includes(`:${homeworkId}`);
    });
    
    return c.json({ submissions: hwSubmissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return c.json({ error: "Failed to fetch submissions", details: String(error) }, 500);
  }
});

// Grade homework submission (Teacher only)
app.put("/make-server-4896d9cd/admin/submissions/:userId/:homeworkId", async (c) => {
  try {
    const { userId, homeworkId } = c.req.param();
    const { score, feedback } = await c.req.json();
    
    const submission = await kv.get(`submission:${userId}:${homeworkId}`);
    if (!submission) {
      return c.json({ error: "Submission not found" }, 404);
    }
    
    const gradedSubmission = {
      ...submission,
      score,
      feedback,
      gradedAt: new Date().toISOString(),
      status: "graded"
    };
    
    await kv.set(`submission:${userId}:${homeworkId}`, gradedSubmission);
    
    // Create notification for student
    const notifId = `notif-${Date.now()}`;
    const notification = {
      id: notifId,
      type: "homework",
      title: "作业已批改",
      message: `您的作业已批改完成，得分：${score}分`,
      time: "刚刚",
      read: false,
      category: "作业通知",
      createdAt: new Date().toISOString()
    };
    await kv.set(`notification:${userId}:${notifId}`, notification);
    
    return c.json({ message: "Homework graded successfully", submission: gradedSubmission });
  } catch (error) {
    console.error("Error grading homework:", error);
    return c.json({ error: "Failed to grade homework", details: String(error) }, 500);
  }
});

// Get all students (Teacher only)
app.get("/make-server-4896d9cd/admin/students", async (c) => {
  try {
    const students = await kv.getByPrefix("student:");
    return c.json({ students: students || [] });
  } catch (error) {
    console.error("Error fetching students:", error);
    return c.json({ error: "Failed to fetch students", details: String(error) }, 500);
  }
});

// Get student details with progress (Teacher only)
app.get("/make-server-4896d9cd/admin/students/:id", async (c) => {
  try {
    const studentId = c.req.param("id");
    const student = await kv.get(`student:${studentId}`);
    
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }
    
    // Get all progress data for this student
    const progressData = await kv.getByPrefix(`progress:${studentId}:`);
    
    // Get all submissions for this student
    const submissions = await kv.getByPrefix(`submission:${studentId}:`);
    
    return c.json({ 
      student,
      progress: progressData || [],
      submissions: submissions || []
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return c.json({ error: "Failed to fetch student details", details: String(error) }, 500);
  }
});

// Initialize demo students
app.post("/make-server-4896d9cd/admin/init-students", async (c) => {
  try {
    const demoStudents = [
      {
        id: "student1",
        name: "张三",
        studentId: "2021001",
        email: "zhangsan@suat.edu.cn",
        major: "计算机科学",
        class: "计科2101",
        enrolledCourses: ["course1", "course2", "course3"]
      },
      {
        id: "student2",
        name: "李四",
        studentId: "2021002",
        email: "lisi@suat.edu.cn",
        major: "软件工程",
        class: "软工2101",
        enrolledCourses: ["course1", "course2"]
      },
      {
        id: "student3",
        name: "王五",
        studentId: "2021003",
        email: "wangwu@suat.edu.cn",
        major: "信息安全",
        class: "信安2101",
        enrolledCourses: ["course2", "course3"]
      }
    ];
    
    for (const student of demoStudents) {
      await kv.set(`student:${student.id}`, student);
    }
    
    return c.json({ message: "Demo students initialized", count: demoStudents.length });
  } catch (error) {
    console.error("Error initializing students:", error);
    return c.json({ error: "Failed to initialize students", details: String(error) }, 500);
  }
});

// Send notification to student (Teacher only)
app.post("/make-server-4896d9cd/admin/notifications", async (c) => {
  try {
    const { userId, title, message, type, category } = await c.req.json();
    const notifId = `notif-${Date.now()}`;
    
    const notification = {
      id: notifId,
      type: type || "system",
      title,
      message,
      time: "刚刚",
      read: false,
      category: category || "系统通知",
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`notification:${userId}:${notifId}`, notification);
    return c.json({ message: "Notification sent successfully", notification });
  } catch (error) {
    console.error("Error sending notification:", error);
    return c.json({ error: "Failed to send notification", details: String(error) }, 500);
  }
});

// Broadcast notification to all students (Teacher only)
app.post("/make-server-4896d9cd/admin/notifications/broadcast", async (c) => {
  try {
    const { title, message, type, category } = await c.req.json();
    const students = await kv.getByPrefix("student:");
    
    let count = 0;
    for (const student of students) {
      const notifId = `notif-${Date.now()}-${count}`;
      const notification = {
        id: notifId,
        type: type || "system",
        title,
        message,
        time: "刚刚",
        read: false,
        category: category || "系统通知",
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`notification:${student.id}:${notifId}`, notification);
      count++;
    }
    
    return c.json({ message: `Notification broadcast to ${count} students`, count });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return c.json({ error: "Failed to broadcast notification", details: String(error) }, 500);
  }
});

// Get analytics data (Teacher only)
app.get("/make-server-4896d9cd/admin/analytics", async (c) => {
  try {
    const courses = await kv.getByPrefix("course:");
    const students = await kv.getByPrefix("student:");
    const submissions = await kv.getByPrefix("submission:");
    const homework = await kv.getByPrefix("homework:");
    
    // Calculate statistics
    const totalCourses = courses.length;
    const totalStudents = students.length;
    const totalHomework = homework.length;
    const totalSubmissions = submissions.length;
    
    // Calculate average score
    const gradedSubmissions = submissions.filter((s: any) => s.score !== null && s.score !== undefined);
    const averageScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0;
    
    // Calculate submission rate
    const submissionRate = totalHomework > 0 ? (totalSubmissions / totalHomework) * 100 : 0;
    
    return c.json({
      analytics: {
        totalCourses,
        totalStudents,
        totalHomework,
        totalSubmissions,
        averageScore: Math.round(averageScore * 10) / 10,
        submissionRate: Math.round(submissionRate * 10) / 10,
        courses,
        recentSubmissions: submissions.slice(0, 10)
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json({ error: "Failed to fetch analytics", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);