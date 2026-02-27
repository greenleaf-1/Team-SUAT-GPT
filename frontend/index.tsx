import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Briefcase, BookOpen, UserCheck, LogOut, ChevronRight, Lock, Cpu } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState({ username: '加载中...', role: 'GUEST' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html?redirect=index.html';
      return;
    }

    fetch('http://localhost:8080/api/auth/me', {
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
    { id: 'recruit', title: 'AI 招聘系统', desc: '上传简历，开启智能面试', icon: <Briefcase size={32} className="text-purple-600" />, link: 'recruit.html', color: 'bg-purple-50', roles: ['CANDIDATE', 'ADMIN'] },
    { id: 'course', title: '智能制课中心', desc: 'AI 辅助生成专业课程与课件', icon: <BookOpen size={32} className="text-blue-600" />, link: 'ai-course.html', color: 'bg-blue-50', roles: ['ADMIN'] },
    { id: 'admin', title: '部长管理后台', desc: '监控面试进度与候选人状态', icon: <UserCheck size={32} className="text-green-600" />, link: 'admin.html', color: 'bg-green-50', roles: ['ADMIN'] },
    // 在 src/main.tsx 的 allSystems 数组中增加这一项：
    {
      id: 'aichat',
      title: 'AI 智能对话',
      desc: '连接多模型的知识库与代码助手',
      icon: <Cpu size={32} className="text-teal-600" />,
      link: 'ai-chat.html', // 物理指向我们刚建好的入口
      color: 'bg-teal-50',
      roles: ['CANDIDATE', 'ADMIN'] // 大家都能用
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-4xl font-extrabold text-purple-800 mb-2">智能工作台</h1>
          <p className="text-gray-500">你好，{user.username} <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">{user.role}</span></p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold"><LogOut size={18}/> 退出</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {allSystems.map((sys) => {
          const hasAccess = sys.roles.includes(user.role);
          return (
            <div 
              key={sys.id}
              onClick={() => hasAccess && (window.location.href = sys.link)}
              className={`p-8 rounded-2xl bg-white border transition-all ${hasAccess ? 'cursor-pointer hover:shadow-xl' : 'opacity-50 grayscale cursor-not-allowed'}`}
            >
              <div className={`w-16 h-16 rounded-lg ${sys.color} flex items-center justify-center mb-6`}>
                {hasAccess ? sys.icon : <Lock size={32} className="text-gray-400" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{sys.title} {!hasAccess && '🔒'}</h3>
              <p className="text-gray-500 text-sm">{sys.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);