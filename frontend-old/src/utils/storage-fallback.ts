// 本地存储降级方案 - 当Supabase不可用时使用
// 这个文件提供了一个完整的本地存储API，与Supabase API接口一致

const STORAGE_PREFIX = 'suat-local-';

// 辅助函数：从localStorage获取数据
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// 辅助函数：保存数据到localStorage
function setLocal(key: string, value: any): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// ===== Courses API =====
export async function getCourses() {
  return getLocal('courses', [
    {
      id: 'course1',
      name: '高等数学',
      teacher: '张教授',
      progress: 65,
      totalChapters: 12,
      completedChapters: 8,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      description: '高等数学是工科专业的重要基础课程，包括微积分、线性代数等内容。',
      chapters: [
        { id: 1, title: '第一章 函数与极限', sections: 8, completed: true },
        { id: 2, title: '第二章 导数与微分', sections: 6, completed: true },
        { id: 3, title: '第三章 微分中值定理', sections: 5, completed: false },
        { id: 4, title: '第四章 不定积分', sections: 7, completed: false }
      ]
    },
    {
      id: 'course2',
      name: '大学物理',
      teacher: '李教授',
      progress: 45,
      totalChapters: 10,
      completedChapters: 5,
      coverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
      description: '大学物理涵盖力学、热学、电磁学、光学和近代物理等内容。',
      chapters: [
        { id: 1, title: '第一章 质点运动学', sections: 6, completed: true },
        { id: 2, title: '第二章 牛顿运动定律', sections: 5, completed: true },
        { id: 3, title: '第三章 动量守恒定律', sections: 4, completed: false },
        { id: 4, title: '第四章 机械能守恒定律', sections: 6, completed: false }
      ]
    },
    {
      id: 'course3',
      name: '程序设计基础',
      teacher: '王教授',
      progress: 80,
      totalChapters: 8,
      completedChapters: 6,
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
      description: '学习计算机编程的基础知识，包括算法、数据结构和程序设计方法。',
      chapters: [
        { id: 1, title: '第一章 程序设计入门', sections: 5, completed: true },
        { id: 2, title: '第二章 数据类型与运算', sections: 6, completed: true },
        { id: 3, title: '第三章 控制结构', sections: 7, completed: true },
        { id: 4, title: '第四章 函数与模块', sections: 5, completed: false }
      ]
    }
  ]);
}

export async function getCourse(courseId: string) {
  const courses = await getCourses();
  return courses.find((c: any) => c.id === courseId) || null;
}

export async function initializeCourses() {
  const courses = await getCourses();
  setLocal('courses', courses);
  return { message: 'Courses initialized locally', count: courses.length };
}

// ===== User Progress API =====
export async function getProgress(courseId: string) {
  const progress = getLocal(`progress-${courseId}`, {
    currentChapter: 1,
    currentSection: 1,
    percentage: 0
  });
  return progress;
}

export async function updateProgress(courseId: string, progressData: any) {
  setLocal(`progress-${courseId}`, progressData);
  return { message: 'Progress updated locally', progress: progressData };
}

// ===== Bookmarks API =====
export async function getBookmarks(courseId: string) {
  return getLocal(`bookmarks-${courseId}`, []);
}

export async function addBookmark(courseId: string, bookmark: any) {
  const bookmarks = await getBookmarks(courseId);
  const newBookmark = {
    ...bookmark,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  bookmarks.push(newBookmark);
  setLocal(`bookmarks-${courseId}`, bookmarks);
  return { message: 'Bookmark added locally', bookmarks };
}

export async function deleteBookmark(courseId: string, bookmarkId: string) {
  const bookmarks = await getBookmarks(courseId);
  const filtered = bookmarks.filter((b: any) => b.id !== bookmarkId);
  setLocal(`bookmarks-${courseId}`, filtered);
  return { message: 'Bookmark deleted locally', bookmarks: filtered };
}

// ===== Notes API =====
export async function getNotes(courseId: string) {
  return getLocal(`notes-${courseId}`, []);
}

export async function addNote(courseId: string, note: any) {
  const notes = await getNotes(courseId);
  const newNote = {
    ...note,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  notes.push(newNote);
  setLocal(`notes-${courseId}`, notes);
  return { message: 'Note added locally', notes };
}

export async function updateNote(courseId: string, noteId: string, note: any) {
  const notes = await getNotes(courseId);
  const index = notes.findIndex((n: any) => n.id === noteId);
  if (index >= 0) {
    notes[index] = { ...notes[index], ...note, updatedAt: new Date().toISOString() };
    setLocal(`notes-${courseId}`, notes);
    return { message: 'Note updated locally', notes };
  }
  throw new Error('Note not found');
}

export async function deleteNote(courseId: string, noteId: string) {
  const notes = await getNotes(courseId);
  const filtered = notes.filter((n: any) => n.id !== noteId);
  setLocal(`notes-${courseId}`, filtered);
  return { message: 'Note deleted locally', notes: filtered };
}

// ===== Homework API =====
export async function getHomework(courseId: string) {
  return getLocal('homework', [
    {
      id: 'hw1',
      courseId: 'course1',
      title: '第一章习题',
      chapter: 1,
      deadline: '2025-12-05',
      status: 'completed',
      score: 95,
      totalScore: 100
    },
    {
      id: 'hw2',
      courseId: 'course1',
      title: '第二章习题',
      chapter: 2,
      deadline: '2025-12-10',
      status: 'graded',
      score: 88,
      totalScore: 100
    },
    {
      id: 'hw3',
      courseId: 'course1',
      title: '第三章习题',
      chapter: 3,
      deadline: '2025-12-15',
      status: 'pending',
      score: null,
      totalScore: 100
    }
  ]).then(allHomework => allHomework.filter((hw: any) => hw.courseId === courseId));
}

export async function getSubmission(homeworkId: string) {
  return getLocal(`submission-${homeworkId}`, null);
}

export async function submitHomework(homeworkId: string, submissionData: any) {
  const submission = {
    ...submissionData,
    submittedAt: new Date().toISOString(),
    status: 'submitted'
  };
  setLocal(`submission-${homeworkId}`, submission);
  return { message: 'Homework submitted locally', submission };
}

export async function initializeHomework() {
  return { message: 'Homework initialized locally' };
}

// ===== Notifications API =====
export async function getNotifications() {
  return getLocal('notifications', [
    {
      id: 'notif1',
      type: 'homework',
      title: '作业批改完成',
      message: '您的《高等数学》第二章作业已批改完成，得分88分',
      time: '2小时前',
      read: false,
      category: '作业通知'
    },
    {
      id: 'notif2',
      type: 'course',
      title: '新课程上线',
      message: '《数据结构与算法》课程已上线，快来学习吧！',
      time: '5小时前',
      read: false,
      category: '课程通知'
    },
    {
      id: 'notif3',
      type: 'system',
      title: '系统维护通知',
      message: '系统将于本周六凌晨2:00-4:00进行维护升级',
      time: '1天前',
      read: true,
      category: '系统通知'
    },
    {
      id: 'notif4',
      type: 'exam',
      title: '考试安排通知',
      message: '《大学物理》期末考试时间已确定：12月28日上午9:00-11:00',
      time: '2天前',
      read: false,
      category: '考试通知'
    }
  ]);
}

export async function markNotificationAsRead(notificationId: string) {
  const notifications = await getNotifications();
  const index = notifications.findIndex((n: any) => n.id === notificationId);
  if (index >= 0) {
    notifications[index].read = true;
    setLocal('notifications', notifications);
    return { message: 'Notification marked as read', notification: notifications[index] };
  }
  throw new Error('Notification not found');
}

export async function initializeNotifications() {
  return { message: 'Notifications initialized locally' };
}

// ===== User Profile API =====
export async function getUserProfile() {
  return getLocal('profile', {
    name: '张同学',
    studentId: '2021001234',
    major: '计算机科学与技术',
    class: '计科2101班',
    email: 'zhangxuesheng@suat.edu.cn',
    phone: '138****5678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    stats: {
      totalCourses: 6,
      completedCourses: 2,
      totalHours: 128,
      averageScore: 87.5
    }
  });
}

export async function updateUserProfile(profileData: any) {
  setLocal('profile', profileData);
  return { message: 'Profile updated locally', profile: profileData };
}

// ===== Chat History API =====
export async function getChatHistory() {
  return getLocal('chat', []);
}

export async function saveChatMessage(message: any) {
  const chatHistory = await getChatHistory();
  chatHistory.push({ ...message, timestamp: new Date().toISOString() });
  setLocal('chat', chatHistory);
  return { message: 'Message saved locally', chatHistory };
}

export async function clearChatHistory() {
  setLocal('chat', []);
  return { message: 'Chat history cleared locally' };
}
