import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
// 🚀 确保这里包含了所有用到的组件
import { 
  Briefcase, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  ChevronRight, // 添加这一行
  Lock, 
  Cpu, 
  Terminal, 
  FileText,     // 添加这一行 (用于学生端)
  Presentation  // 添加这一行 (用于导师端)
} from 'lucide-react';
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';

const App = () => {
  const [user, setUser] = useState({ username: '加载中...', role: 'GUEST' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html?redirect=index.html';
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
      if (data.username) setUser(data);
    })
    .catch(() => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
  };

  const allSystems = [
      // 🔒 1. 只有 ADMIN 能进
      { 
        id: 'recruit', 
        title: 'AI面试官招聘系统企业管理端', 
        desc: '请企业招聘负责人在此发布招聘信息、查看报名结果、进行录用决策', 
        icon: <Briefcase size={32} className="text-purple-600" />, 
        link: 'recruit.html', 
        color: 'bg-purple-50', 
        roles: ['ADMIN'] // 保持仅限管理员
      },
      
      // ✅ 2. 所有人都能进 (ADMIN, CANDIDATE, MENTOR)
      { 
        id: 'interview', 
        title: 'AI面试官招聘系统求职应聘端', 
        desc: '请求职者在此浏览岗位、上传简历、开启 AI 面试', 
        icon: <Terminal size={32} className="text-indigo-600" />, 
        link: 'interview.html', 
        color: 'bg-indigo-50', 
        roles: ['CANDIDATE', 'ADMIN', 'MENTOR'] // 👈 增加 MENTOR
      },

      // ✅ 3. 学生系统 (ADMIN, CANDIDATE, MENTOR)
      { 
        id: 'student-report', 
        title: 'AI面试官作业系统学生提交端', 
        desc: '请学生在此提交作业、报告，接受 AI 质询', 
        icon: <FileText size={32} className="text-orange-600" />, 
        link: 'student.html', 
        color: 'bg-orange-50', 
        roles: ['CANDIDATE', 'ADMIN', 'MENTOR'] // 👈 增加 MENTOR，方便老师查看学生视角
      },

      // ✅ 4. 只有老师和管理员能进
      { 
        id: 'mentor-platform', 
        title: 'AI面试官作业系统教师管理端', 
        desc: '请教师在此审阅学生周报、查看 AI 审计报告与得分', 
        icon: <Presentation size={32} className="text-rose-600" />, 
        link: 'mentor.html', 
        color: 'bg-rose-50', 
        roles: ['MENTOR', 'ADMIN'] 
      },

      // ✅ 5. 所有人都能进
      { 
        id: 'course', 
        title: 'AI面试官企业培训开发平台', 
        desc: 'AI辅助生成专业培训课程与课件', 
        icon: <BookOpen size={32} className="text-blue-600" />, 
        link: 'ai-course.html', 
        color: 'bg-blue-50', 
        roles: ['ADMIN', 'MENTOR', 'CANDIDATE'] // 👈 全部放开
      },
      
      // ✅ 6. 只有管理员和老师能看成员状态
      { 
        id: 'admin', 
        title: 'AI面试官领导决策数据罗盘', 
        desc: '领导在此查看成员注册信息状态', 
        icon: <UserCheck size={32} className="text-green-600" />, 
        link: 'admin.html', 
        color: 'bg-green-50', 
        roles: ['ADMIN', 'MENTOR'] // 👈 增加 MENTOR
      },
      
      // ✅ 7. 所有人都能对话
      {
        id: 'aichat',
        title: 'AI面试官对话系统',
        desc: '企业私有化定制知识库部署的对话系统',
        icon: <Cpu size={32} className="text-teal-600" />,
        link: 'ai-chat.html',
        color: 'bg-teal-50',
        roles: ['CANDIDATE', 'ADMIN', 'MENTOR'] 
      },
    ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-4xl font-extrabold text-purple-800 mb-2">AI面试官</h1>
          <p className="text-gray-500">你好，{user.username} <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">{user.role}</span></p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold hover:scale-105 transition-all">
          <LogOut size={18}/> 退出
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {allSystems.map((sys) => {
          const hasAccess = sys.roles.includes(user.role);
          return (
            <div 
              key={sys.id}
              onClick={() => hasAccess && (window.location.href = sys.link)}
              className={`p-8 rounded-3xl bg-white border-2 transition-all duration-300 ${
                hasAccess 
                ? 'cursor-pointer hover:shadow-2xl hover:border-purple-200 border-transparent relative overflow-hidden group' 
                : 'opacity-50 grayscale cursor-not-allowed border-dashed border-gray-200'
              }`}
            >
              {/* 装饰性背景 */}
              {hasAccess && <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${sys.color} group-hover:scale-150 transition-transform`}></div>}
              
              <div className={`w-16 h-16 rounded-2xl ${sys.color} flex items-center justify-center mb-6 shadow-inner`}>
                {hasAccess ? sys.icon : <Lock size={32} className="text-gray-400" />}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{sys.title} {!hasAccess && '🔒'}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{sys.desc}</p>
              
              {hasAccess && (
                <div className="mt-6 flex items-center text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  立即进入 <ChevronRight size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);