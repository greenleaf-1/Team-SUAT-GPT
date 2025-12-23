import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Bell, 
  BarChart3, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export default function AdminDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if teacher is logged in
    const teacherData = localStorage.getItem('teacher');
    if (!teacherData) {
      router.push('/admin/login');
      return;
    }
    setTeacher(JSON.parse(teacherData));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load courses
      const coursesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/courses`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const coursesData = await coursesRes.json();
      setCourses(coursesData.courses || []);

      // Load students
      const studentsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/admin/students`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const studentsData = await studentsRes.json();
      setStudents(studentsData.students || []);

      // Load analytics
      const analyticsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/admin/analytics`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    localStorage.removeItem('teacherToken');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">教师管理后台</h1>
              <p className="text-gray-600">欢迎回来，{teacher?.name || '老师'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-4 transition-colors border-b-2 ${
                activeTab === 'overview' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              数据概览
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-6 py-4 transition-colors border-b-2 ${
                activeTab === 'courses' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              课程管理
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-6 py-4 transition-colors border-b-2 ${
                activeTab === 'students' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              学生管理
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-2 px-6 py-4 transition-colors border-b-2 ${
                activeTab === 'homework' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              作业管理
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-6 py-4 transition-colors border-b-2 ${
                activeTab === 'notifications' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-5 h-5" />
              通知推送
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <OverviewTab analytics={analytics} courses={courses} students={students} />
        )}
        {activeTab === 'courses' && (
          <CoursesTab courses={courses} onRefresh={loadData} />
        )}
        {activeTab === 'students' && (
          <StudentsTab students={students} />
        )}
        {activeTab === 'homework' && (
          <HomeworkTab courses={courses} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab students={students} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ analytics, courses, students }: any) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">总课程数</p>
          <h3 className="text-gray-900">{analytics?.totalCourses || 0}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">学生总数</p>
          <h3 className="text-gray-900">{analytics?.totalStudents || 0}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">作业总数</p>
          <h3 className="text-gray-900">{analytics?.totalHomework || 0}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">平均分数</p>
          <h3 className="text-gray-900">{analytics?.averageScore || 0}</h3>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-gray-900 mb-4">课程列表</h3>
        <div className="space-y-3">
          {courses.slice(0, 5).map((course: any) => (
            <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {course.coverImage && (
                  <img src={course.coverImage} alt={course.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div>
                  <h4 className="text-gray-900">{course.name}</h4>
                  <p className="text-gray-600">教师：{course.teacher}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900">{course.progress}%</p>
                <p className="text-gray-600">完成进度</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Courses Tab Component
function CoursesTab({ courses, onRefresh }: any) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('确定要删除这门课程吗？')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/admin/courses/${courseId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        alert('课程删除成功');
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-900">课程管理</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          创建课程
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {course.coverImage && (
              <img src={course.coverImage} alt={course.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-gray-900 mb-2">{course.name}</h3>
              <p className="text-gray-600 mb-4">教师：{course.teacher}</p>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-gray-600">{course.progress}%</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert('编辑功能开发中')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateCourseModal onClose={() => setShowCreateModal(false)} onSuccess={onRefresh} />
      )}
    </div>
  );
}

// Students Tab Component
function StudentsTab({ students }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-gray-900">学生管理</h2>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">学号</th>
              <th className="px-6 py-3 text-left text-gray-700">姓名</th>
              <th className="px-6 py-3 text-left text-gray-700">专业</th>
              <th className="px-6 py-3 text-left text-gray-700">班级</th>
              <th className="px-6 py-3 text-left text-gray-700">邮箱</th>
              <th className="px-6 py-3 text-left text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student: any) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{student.studentId}</td>
                <td className="px-6 py-4 text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-gray-600">{student.major}</td>
                <td className="px-6 py-4 text-gray-600">{student.class}</td>
                <td className="px-6 py-4 text-gray-600">{student.email}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700">
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Homework Tab Component
function HomeworkTab({ courses }: any) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-900">作业管理</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          发布作业
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600">作业列表功能开发中...</p>
      </div>

      {showCreateModal && (
        <CreateHomeworkModal 
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            alert('作业发布成功！');
          }}
        />
      )}
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({ students }: any) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title || !message) {
      alert('请填写标题和内容');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/admin/notifications/broadcast`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ title, message, type, category: '系统通知' })
        }
      );

      if (response.ok) {
        alert('通知发送成功！');
        setTitle('');
        setMessage('');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('发送失败');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-gray-900">通知推送</h2>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">通知类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="system">系统通知</option>
              <option value="course">课程通知</option>
              <option value="homework">作业通知</option>
              <option value="exam">考试通知</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">通知标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="请输入通知标题"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">通知内容</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="请输入通知内容"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleBroadcast}
              disabled={sending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {sending ? '发送中...' : '发送给所有学生'}
            </button>
            <p className="text-gray-600">将发送给 {students.length} 名学生</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Course Modal
function CreateCourseModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    description: '',
    totalChapters: 0,
    coverImage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/admin/courses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        alert('课程创建成功！');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('创建失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-gray-900 mb-4">创建新课程</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">课程名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">教师姓名</label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">课程描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">总章节数</label>
            <input
              type="number"
              value={formData.totalChapters}
              onChange={(e) => setFormData({ ...formData, totalChapters: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">封面图片URL（可选）</label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Homework Modal
function CreateHomeworkModal({ courses, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    chapter: 1,
    deadline: '',
    totalScore: 100,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4896d9cd/admin/homework`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create homework:', error);
      alert('创建失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-gray-900 mb-4">发布作业</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">选择课程</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">请选择课程</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">作业标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">章节</label>
            <input
              type="number"
              value={formData.chapter}
              onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">截止日期</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">总分</label>
            <input
              type="number"
              value={formData.totalScore}
              onChange={(e) => setFormData({ ...formData, totalScore: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              发布
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
