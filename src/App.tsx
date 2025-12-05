import { useState, useEffect } from 'react';
import { Home, MessageSquare, Bell, User } from 'lucide-react';
import { AIChat } from './components/AIChat';
import { LearningCenter } from './components/LearningCenter';
import { NotificationCenter } from './components/NotificationCenter';
import { PersonalCenter } from './components/PersonalCenter';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AISettings } from './components/AISettings';
import { NetworkDiagnostics } from './components/NetworkDiagnostics';
import logoImage from 'figma:asset/03edc2d2f6090258e8265fc358ece72f082955b2.png';

type TabType = 'ai' | 'learning' | 'notifications' | 'personal';
type ViewType = 'student' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [currentView, setCurrentView] = useState<ViewType>('student');
  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    // Check if teacher is already logged in
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      setTeacher(JSON.parse(teacherData));
      setCurrentView('admin-dashboard');
    }
  }, []);

  const handleAdminLogin = (teacherData: any) => {
    setTeacher(teacherData);
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('teacher');
    localStorage.removeItem('teacherToken');
    setTeacher(null);
    setCurrentView('student');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AIChat />;
      case 'learning':
        return <LearningCenter />;
      case 'notifications':
        return <NotificationCenter />;
      case 'personal':
        return <PersonalCenter />;
      default:
        return <AIChat />;
    }
  };

  // Render admin views
  if (currentView === 'admin-login') {
    return (
      <AdminLogin 
        onLoginSuccess={handleAdminLogin}
        onBack={() => setCurrentView('student')}
      />
    );
  }

  if (currentView === 'admin-dashboard' && teacher) {
    return (
      <AdminDashboard 
        teacher={teacher}
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <>
      <AISettings />
      <NetworkDiagnostics />
      
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="SUAT Logo" className="h-10" />
          </div>
          <button
            onClick={() => setCurrentView('admin-login')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            教师入口 →
          </button>
        </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'ai' ? 'bg-purple-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={24} />
            <span className="text-sm">AI</span>
          </button>
          
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'learning' ? 'bg-purple-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home size={24} />
            <span className="text-sm">学习中心</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'notifications' ? 'bg-purple-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell size={24} />
            <span className="text-sm">通知中心</span>
          </button>
          
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'personal' ? 'bg-purple-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={24} />
            <span className="text-sm">个人中心</span>
          </button>
        </div>
      </nav>
      </div>
    </>
  );
}
