import { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { studentLogin } from '../utils/api-new';
import { BACKEND_TYPE } from '../config/backend.config';

interface StudentLoginProps {
  onLoginSuccess: (studentData: any) => void;
  onBack?: () => void;
}

export function StudentLogin({ onLoginSuccess, onBack }: StudentLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // api-new.studentLogin expects { studentId, password } and returns { token, user }
      const result = await studentLogin({ studentId: username, password });

      if (result && result.token) {
        // 保存 token 到通用 key 'authToken'，以便所有 API 调用使用
        localStorage.setItem('authToken', result.token);

        // 尝试从后端获取完整用户信息
        try {
          const { getCurrentUser } = await import('../utils/api-new');
          const me = await getCurrentUser();
          if (me) {
            localStorage.setItem('student', JSON.stringify(me));
            onLoginSuccess(me);
            // Redirect to main app (AI chat tab)
            window.location.href = '/';
          } else {
            // 回退到登录返回的 user 或仅用 username
            if (result.user) {
              localStorage.setItem('student', JSON.stringify(result.user));
              onLoginSuccess(result.user);
            } else {
              onLoginSuccess({ id: username });
            }
          }
        } catch (err) {
          console.warn('无法获取当前用户信息，使用登录返回的数据作为回退', err);
          if (result.user) {
            localStorage.setItem('student', JSON.stringify(result.user));
            onLoginSuccess(result.user);
          } else {
            onLoginSuccess({ id: username });
          }
        }
      } else {
        setError('登录失败，请检查用户名和密码');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername('zhangsan');
    setPassword('123456');
    setError('');
    
    // 自动提交
    setTimeout(() => {
      document.getElementById('login-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* 返回按钮 */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
        )}

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <User size={32} className="text-purple-600" />
          </div>
          <h1 className="text-3xl mb-2 text-gray-900">学生登录</h1>
          <p className="text-gray-600">
            登录您的 SUAT-GPT 账号
          </p>
        </div>

        {/* 后端类型提示 */}
        <div className={`mb-6 p-3 rounded-lg ${
          BACKEND_TYPE === 'java' 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <p className="text-sm text-center">
            {BACKEND_TYPE === 'java' ? (
              <>
                <span className="font-semibold text-blue-700">🔧 Java 后端模式</span>
                <br />
                <span className="text-blue-600">请确保 Java 后端已启动</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-green-700">☁️ Supabase 后端模式</span>
                <br />
                <span className="text-green-600">使用云端服务，无需配置</span>
              </>
            )}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 登录表单 */}
        <form id="login-form" onSubmit={handleLogin} className="space-y-5">
          {/* 用户名输入 */}
          <div>
            <label htmlFor="username" className="block text-sm mb-2 text-gray-700">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入用户名"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入密码"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>登录中...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>登录</span>
              </>
            )}
          </button>
        </form>

        {/* 演示账号快捷登录 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            使用演示账号登录
          </button>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center mb-2">
              演示账号：
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="text-center">用户名: <span className="font-mono bg-white px-2 py-1 rounded">zhangsan</span></p>
              <p className="text-center">密码: <span className="font-mono bg-white px-2 py-1 rounded">123456</span></p>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            还没有账号？请联系教师添加
          </p>
        </div>
      </div>
    </div>
  );
}
