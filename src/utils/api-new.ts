/**
 * API调用封装
 * 支持真实后端调用和Mock数据
 */

import { API_CONFIG, API_ENDPOINTS, buildUrl, getHeaders } from './api-config';

// Mock数据开关
const USE_MOCK = API_CONFIG.USE_MOCK_DATA;

// ==================== 通用请求函数 ====================

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = (API_CONFIG && API_CONFIG.TIMEOUT) ? API_CONFIG.TIMEOUT : 30000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getHeaders(true), // 自动在有 token 时加入 Authorization
        ...options.headers,
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      // Try to parse JSON error body when possible
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.message || `请求失败: ${response.status}`;
      const err = new Error(msg);
      // Attach status for upstream handlers
      (err as any).status = response.status;
      throw err;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timer);
    console.error('API请求失败:', error);

    // Distinguish common failure modes and produce friendlier messages
    if (error.name === 'AbortError') {
      throw new Error('请求超时：无法在规定时间内连接到后端。请检查后端服务是否启动（运行在 localhost:8080），或网络是否正常。');
    }

    // Browser network layer failures (e.g. server not reachable) typically surface as TypeError with message 'Failed to fetch'
    if (error instanceof TypeError && String(error.message).toLowerCase().includes('failed to fetch')) {
      throw new Error('网络错误：无法连接到后端。请确保 Java 后端已启动并能被本地访问（http://localhost:8080）。');
    }

    // Re-throw original error for other handlers
    throw error;
  }
}

// ==================== 认证相关 API ====================

export interface StudentLoginRequest {
  studentId: string;
  password: string;
}

export interface TeacherLoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
}

export async function studentLogin(data: StudentLoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    // Mock数据
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      token: 'mock-student-token-' + Date.now(),
      user: {
        id: data.studentId,
        name: '张三',
        studentId: data.studentId,
        major: '计算机科学与技术',
        grade: '2023级',
      }
    };
  }

  // 后端使用统一的 /auth/login 接口，接受 { username, password }
  const payload = { username: data.studentId, password: data.password };

  const resp = await request<any>(
    buildUrl(API_ENDPOINTS.AUTH.LOGIN),
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return {
    token: resp.token,
    user: resp.user || { id: data.studentId },
  };
}

// 获取当前认证用户信息 (调用 GET /api/auth/me)
export async function getCurrentUser(): Promise<any> {
  if (USE_MOCK) {
    return {
      id: '2023001',
      username: 'zhangsan',
      role: 'USER',
    };
  }

  return request(buildUrl(API_ENDPOINTS.AUTH.ME));
}

export async function teacherLogin(data: TeacherLoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    // Mock数据
    await new Promise(resolve => setTimeout(resolve, 500));
    if (data.username === 'admin' && data.password === 'admin123') {
      return {
        token: 'mock-teacher-token-' + Date.now(),
        user: {
          id: '1',
          username: 'admin',
          name: '王老师',
          department: '计算机学院',
        }
      };
    }
    throw new Error('用户名或密码错误');
  }

  // 后端使用统一的 /auth/login 接口
  const payload = { username: data.username, password: data.password };

  const resp = await request<any>(
    buildUrl(API_ENDPOINTS.AUTH.LOGIN),
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return {
    token: resp.token,
    user: resp.user || { username: data.username },
  };
}

// 注册新用户（调用后端 /auth/register）
export async function registerUser(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (username && password) return { success: true, message: 'mock registered' };
    throw new Error('Invalid input');
  }

  const resp = await request<any>(
    buildUrl(API_ENDPOINTS.AUTH.REGISTER),
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }
  );

  return { success: true, message: resp.message };
}

// ==================== 学生相关 API ====================

export async function getUserProfile() {
  if (USE_MOCK) {
    return {
      id: '2023001',
      name: '张三',
      studentId: '2023001',
      major: '计算机科学与技术',
      grade: '2023级',
      avatar: '',
      email: 'zhangsan@suat.edu.cn',
      phone: '138****1234',
      enrollmentYear: 2023,
      credits: 45,
      gpa: 3.75,
    };
  }

  return request(buildUrl(API_ENDPOINTS.STUDENT.PROFILE));
}

export async function getCourses() {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        name: 'Java程序设计',
        teacher: '李老师',
        credits: 4,
        schedule: '周一 1-2节, 周三 3-4节',
        classroom: '教学楼A101',
        progress: 75,
        image: '',
      },
      {
        id: '2',
        name: '数据结构',
        teacher: '王老师',
        credits: 4,
        schedule: '周二 1-2节, 周四 3-4节',
        classroom: '教学楼B205',
        progress: 60,
        image: '',
      },
      {
        id: '3',
        name: '数据库原理',
        teacher: '张老师',
        credits: 3,
        schedule: '周三 1-2节, 周五 3-4节',
        classroom: '教学楼C301',
        progress: 45,
        image: '',
      },
    ];
  }

  return request(buildUrl(API_ENDPOINTS.STUDENT.COURSES));
}

export async function getNotifications() {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        type: 'deadline',
        title: 'Java作业即将截止',
        content: 'Java程序设计第三章作业将在明天23:59截止，请及时提交。',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('zh-CN'),
        read: false,
        priority: 'high',
      },
      {
        id: '2',
        type: 'grade',
        title: '成绩已公布',
        content: '数据结构期中考试成绩已公布，您的成绩为92分。',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString('zh-CN'),
        read: false,
        priority: 'normal',
      },
      {
        id: '3',
        type: 'announcement',
        title: '课程调整通知',
        content: '由于教室维修，本周五的数据库原理课程调整到教学楼D402。',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
        read: true,
        priority: 'normal',
      },
    ];
  }

  return request(buildUrl(API_ENDPOINTS.STUDENT.NOTIFICATIONS));
}

export async function markNotificationAsRead(id: string) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  }

  return request(
    buildUrl(API_ENDPOINTS.STUDENT.MARK_NOTIFICATION_READ, { id }),
    { method: 'PUT' }
  );
}

// ==================== AI相关 API ====================

export async function getChatHistory() {
  if (USE_MOCK) {
    return [];
  }

  return request(buildUrl(API_ENDPOINTS.AI.CHAT_HISTORY));
}

export async function saveChatMessage(message: any) {
  if (USE_MOCK) {
    // Mock: 保存到localStorage
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.push(message);
    localStorage.setItem('chatHistory', JSON.stringify(history));
    return { success: true };
  }

  return request(
    buildUrl(API_ENDPOINTS.AI.CHAT),
    {
      method: 'POST',
      body: JSON.stringify(message),
    }
  );
}

// AI聊天接口 - 发送消息并获取AI回复
export interface AIChatRequest {
  message: string;
  // Accept several model identifiers from UI; helper will map to backend keys
  model: 'deepseek' | 'qwen-internal' | 'qwen-public' | 'qwen' | 'qwenPublic';
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export interface AIChatResponse {
  response: string;
  model: string;
  timestamp: string;
}

export async function sendAIChatMessage(data: AIChatRequest): Promise<AIChatResponse> {
  if (USE_MOCK) {
    // Mock AI响应
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponses = [
      '这是一个Mock AI响应。在真实环境中，这将由后端的AI模型生成回答。',
      '你好！我是SUAT-GPT助手。当前处于Mock模式，后端未连接。',
      '收到你的问题："' + data.message + '"。真实环境中，我会提供详细的回答。',
      '很抱歉，当前处于开发模式。请等待后端Java服务启动后再试。',
    ];
    
    return {
      response: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      model: data.model,
      timestamp: new Date().toISOString(),
    };
  }

  // Normalize model identifiers to backend keys: 'qwen-public' | 'qwen-internal' | 'deepseek'
  const normalizeModel = (m: AIChatRequest['model']) => {
    if (!m) return 'qwen-public';
    if (m === 'qwen' || m === 'qwen-internal') return 'qwen-internal';
    if (m === 'qwenPublic' || m === 'qwen-public') return 'qwen-public';
    if (m === 'deepseek') return 'deepseek';
    return 'qwen-public';
  };

  const payload: any = {
    message: data.message,
    modelKey: normalizeModel(data.model),
  };

  const resp = await request<any>(
    buildUrl(API_ENDPOINTS.AI.CHAT),
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  // 后端返回 { sender, content, timestamp }
  return {
    response: resp.content || resp.message || '',
    model: payload.modelKey,
    timestamp: resp.timestamp || new Date().toISOString(),
  };
}

// ==================== 教师管理相关 API ====================

export async function getStudents() {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        studentId: '2023001',
        name: '张三',
        major: '计算机科学与技术',
        grade: '2023级',
        email: 'zhangsan@suat.edu.cn',
        phone: '138****1234',
      },
      {
        id: '2',
        studentId: '2023002',
        name: '李四',
        major: '软件工程',
        grade: '2023级',
        email: 'lisi@suat.edu.cn',
        phone: '139****5678',
      },
    ];
  }

  return request(buildUrl(API_ENDPOINTS.ADMIN.STUDENTS));
}

export async function createStudent(data: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: 'new-' + Date.now() };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.CREATE_STUDENT),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function updateStudent(id: string, data: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.UPDATE_STUDENT, { id }),
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteStudent(id: string) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.DELETE_STUDENT, { id }),
    { method: 'DELETE' }
  );
}

export async function getAdminCourses() {
  if (USE_MOCK) {
    return [
      {
        id: '1',
        name: 'Java程序设计',
        teacher: '李老师',
        credits: 4,
        students: 45,
      },
      {
        id: '2',
        name: '数据结构',
        teacher: '王老师',
        credits: 4,
        students: 52,
      },
    ];
  }

  return request(buildUrl(API_ENDPOINTS.ADMIN.COURSES));
}

export async function createCourse(data: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: 'course-' + Date.now() };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.CREATE_COURSE),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteCourse(id: string) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.DELETE_COURSE, { id }),
    { method: 'DELETE' }
  );
}

export async function broadcastNotification(data: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, sentCount: 45 };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.NOTIFICATIONS),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function getAnalytics() {
  if (USE_MOCK) {
    return {
      totalStudents: 156,
      totalCourses: 12,
      activeStudents: 142,
      pendingHomework: 23,
      courseCompletion: 67.5,
      avgGpa: 3.45,
    };
  }

  return request(buildUrl(API_ENDPOINTS.ADMIN.ANALYTICS));
}

export async function createHomework(data: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id: 'hw-' + Date.now() };
  }

  return request(
    buildUrl(API_ENDPOINTS.ADMIN.CREATE_HOMEWORK),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}