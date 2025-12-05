/**
 * API配置文件
 * 用于配置Java后端的基础URL和请求设置
 */

// Java后端配置
export const API_CONFIG = {
  // Use a relative base so Vite dev proxy can forward requests to the Java backend.
  // This avoids CORS and makes local dev resilient: requests to `/api/*` go through vite proxy.
  BASE_URL: '/api',
  
  // 请求超时时间（毫秒）
  TIMEOUT: 30000,
  
  // 是否启用Mock数据（开发阶段使用）
  // 对接真实后端时，将此值改为 false
  USE_MOCK_DATA: false,
};

// 通用请求头
export const getHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    // Accept several possible storage keys to be robust across login flows
    const tokenKeys = ['authToken', 'teacherToken', 'token', 'jwt'];
    let token: string | null = null;
    for (const k of tokenKeys) {
      const v = localStorage.getItem(k);
      if (v) { token = v; break; }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// API端点常量
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },

  // 学生相关
  STUDENT: {
    PROFILE: '/student/profile',
    COURSES: '/student/courses',
    HOMEWORK: '/student/homework',
    NOTIFICATIONS: '/student/notifications',
    MARK_NOTIFICATION_READ: '/student/notifications/:id/read',
  },

  // 课程相关
  COURSE: {
    LIST: '/courses',
    DETAIL: '/courses/:id',
    CHAPTERS: '/courses/:id/chapters',
    HOMEWORK: '/courses/:id/homework',
    SUBMIT_HOMEWORK: '/courses/:courseId/homework/:homeworkId/submit',
  },

  // 教师管理相关
  ADMIN: {
    STUDENTS: '/admin/students',
    STUDENT_DETAIL: '/admin/students/:id',
    CREATE_STUDENT: '/admin/students',
    UPDATE_STUDENT: '/admin/students/:id',
    DELETE_STUDENT: '/admin/students/:id',
    
    COURSES: '/admin/courses',
    CREATE_COURSE: '/admin/courses',
    UPDATE_COURSE: '/admin/courses/:id',
    DELETE_COURSE: '/admin/courses/:id',
    
    HOMEWORK: '/admin/homework',
    CREATE_HOMEWORK: '/admin/homework',
    UPDATE_HOMEWORK: '/admin/homework/:id',
    DELETE_HOMEWORK: '/admin/homework/:id',
    
    NOTIFICATIONS: '/admin/notifications/broadcast',
    ANALYTICS: '/admin/analytics',
  },

  // AI相关
  AI: {
    CHAT: '/ai/chat',
    CHAT_HISTORY: '/ai/history',
  },
};

// 辅助函数：替换路径参数
export const buildUrl = (endpoint: string, params?: Record<string, string | number>) => {
  let url = API_CONFIG.BASE_URL + endpoint;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};