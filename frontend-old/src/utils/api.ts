import { projectId, publicAnonKey } from './supabase/info';
import * as fallbackStorage from './storage-fallback';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd`;

const defaultUserId = 'demo-user'; // 默认用户ID

// 检查是否应该使用本地存储
let useLocalStorage = false;
let connectionChecked = false;

// 健康检查函数
async function checkSupabaseHealth(): Promise<boolean> {
  if (connectionChecked) {
    return !useLocalStorage;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 增加到8秒超时
    
    const response = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });
    
    clearTimeout(timeoutId);
    connectionChecked = true;
    
    if (response.ok) {
      const data = await response.json();
      useLocalStorage = false;
      console.log('✅ Supabase连接正常', data);
      return true;
    } else {
      useLocalStorage = true;
      console.warn(`⚠️ Supabase响应错误 (${response.status})，已切换到本地存储模式`);
      return false;
    }
  } catch (error: any) {
    console.warn('⚠️ 无法连接到Supabase，已切换到本地存储模式');
    console.log('连接错误详情:', error.name, error.message);
    connectionChecked = true;
    useLocalStorage = true;
    return false;
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // 第一次调用时检查连接
  if (!connectionChecked) {
    await checkSupabaseHealth();
  }
  
  // 如果使用本地存储，直接返回
  if (useLocalStorage) {
    throw new Error('Using local storage fallback');
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // 如果请求失败，切换到本地存储
    console.warn('请求失败，切换到本地存储:', error);
    useLocalStorage = true;
    throw error;
  }
}

// 辅助函数：自动降级
async function withFallback<T>(
  supabaseCall: () => Promise<T>,
  fallbackCall: () => Promise<T>
): Promise<T> {
  try {
    return await supabaseCall();
  } catch (error) {
    console.log('使用本地存储降级方案');
    return await fallbackCall();
  }
}

// 导出健康检查函数供外部使用
export { checkSupabaseHealth };

// ===== Courses API =====
export async function getCourses() {
  return withFallback(
    async () => {
      const data = await fetchAPI('/courses');
      return data.courses;
    },
    () => fallbackStorage.getCourses()
  );
}

export async function getCourse(courseId: string) {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/courses/${courseId}`);
      return data.course;
    },
    () => fallbackStorage.getCourse(courseId)
  );
}

export async function initializeCourses() {
  return withFallback(
    () => fetchAPI('/init-courses', { method: 'POST' }),
    () => fallbackStorage.initializeCourses()
  );
}

// ===== User Progress API =====
export async function getProgress(courseId: string) {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/progress/${defaultUserId}/${courseId}`);
      return data.progress;
    },
    () => fallbackStorage.getProgress(courseId)
  );
}

export async function updateProgress(courseId: string, progressData: any) {
  return withFallback(
    () => fetchAPI(`/progress/${defaultUserId}/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    }),
    () => fallbackStorage.updateProgress(courseId, progressData)
  );
}

// ===== Bookmarks API =====
export async function getBookmarks(courseId: string) {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/bookmarks/${defaultUserId}/${courseId}`);
      return data.bookmarks;
    },
    () => fallbackStorage.getBookmarks(courseId)
  );
}

export async function addBookmark(courseId: string, bookmark: any) {
  return withFallback(
    () => fetchAPI(`/bookmarks/${defaultUserId}/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(bookmark),
    }),
    () => fallbackStorage.addBookmark(courseId, bookmark)
  );
}

export async function deleteBookmark(courseId: string, bookmarkId: string) {
  return withFallback(
    () => fetchAPI(`/bookmarks/${defaultUserId}/${courseId}/${bookmarkId}`, {
      method: 'DELETE',
    }),
    () => fallbackStorage.deleteBookmark(courseId, bookmarkId)
  );
}

// ===== Notes API =====
export async function getNotes(courseId: string) {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/notes/${defaultUserId}/${courseId}`);
      return data.notes;
    },
    () => fallbackStorage.getNotes(courseId)
  );
}

export async function addNote(courseId: string, note: any) {
  return withFallback(
    () => fetchAPI(`/notes/${defaultUserId}/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(note),
    }),
    () => fallbackStorage.addNote(courseId, note)
  );
}

export async function updateNote(courseId: string, noteId: string, note: any) {
  return withFallback(
    () => fetchAPI(`/notes/${defaultUserId}/${courseId}/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    }),
    () => fallbackStorage.updateNote(courseId, noteId, note)
  );
}

export async function deleteNote(courseId: string, noteId: string) {
  return withFallback(
    () => fetchAPI(`/notes/${defaultUserId}/${courseId}/${noteId}`, {
      method: 'DELETE',
    }),
    () => fallbackStorage.deleteNote(courseId, noteId)
  );
}

// ===== Homework API =====
export async function getHomework(courseId: string) {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/homework/${courseId}`);
      return data.homework;
    },
    () => fallbackStorage.getHomework(courseId)
  );
}

export async function getSubmission(homeworkId: string) {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/submissions/${defaultUserId}/${homeworkId}`);
      return data.submission;
    },
    () => fallbackStorage.getSubmission(homeworkId)
  );
}

export async function submitHomework(homeworkId: string, submissionData: any) {
  return withFallback(
    () => fetchAPI(`/submissions/${defaultUserId}/${homeworkId}`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    }),
    () => fallbackStorage.submitHomework(homeworkId, submissionData)
  );
}

export async function initializeHomework() {
  return withFallback(
    () => fetchAPI('/init-homework', { method: 'POST' }),
    () => fallbackStorage.initializeHomework()
  );
}

// ===== Notifications API =====
export async function getNotifications() {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/notifications/${defaultUserId}`);
      return data.notifications;
    },
    () => fallbackStorage.getNotifications()
  );
}

export async function markNotificationAsRead(notificationId: string) {
  return withFallback(
    () => fetchAPI(`/notifications/${defaultUserId}/${notificationId}`, {
      method: 'PUT',
    }),
    () => fallbackStorage.markNotificationAsRead(notificationId)
  );
}

export async function initializeNotifications() {
  return withFallback(
    () => fetchAPI('/init-notifications', { method: 'POST' }),
    () => fallbackStorage.initializeNotifications()
  );
}

// ===== User Profile API =====
export async function getUserProfile() {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/profile/${defaultUserId}`);
      return data.profile;
    },
    () => fallbackStorage.getUserProfile()
  );
}

export async function updateUserProfile(profileData: any) {
  return withFallback(
    () => fetchAPI(`/profile/${defaultUserId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    () => fallbackStorage.updateUserProfile(profileData)
  );
}

// ===== Chat History API =====
export async function getChatHistory() {
  return withFallback(
    async () => {
      const data = await fetchAPI(`/chat/${defaultUserId}`);
      return data.messages;
    },
    () => fallbackStorage.getChatHistory()
  );
}

export async function saveChatMessage(message: any) {
  return withFallback(
    () => fetchAPI(`/chat/${defaultUserId}`, {
      method: 'POST',
      body: JSON.stringify(message),
    }),
    () => fallbackStorage.saveChatMessage(message)
  );
}

export async function clearChatHistory() {
  return withFallback(
    () => fetchAPI(`/chat/${defaultUserId}`, {
      method: 'DELETE',
    }),
    () => fallbackStorage.clearChatHistory()
  );
}
