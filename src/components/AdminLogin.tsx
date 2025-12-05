import React, { useState } from 'react';
import { GraduationCap, Lock, User } from 'lucide-react';
import { teacherLogin } from '../utils/api-new';

interface AdminLoginProps {
  onLoginSuccess: (teacher: any) => void;
  onBack: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await teacherLogin({ username, password });

      // Store teacher info in localStorage
      localStorage.setItem('teacher', JSON.stringify(result.user));
    // Keep teacherToken for admin UI, but also set `authToken` so shared API helpers include it
    localStorage.setItem('teacherToken', result.token);
    localStorage.setItem('authToken', result.token);

      // Call success callback
      onLoginSuccess(result.user);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">教师管理后台</h1>
          <p className="text-gray-600">SUAT-GPT 学习管理系统</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-gray-900 mb-6">教师登录</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 mb-2">演示账号：</p>
            <p className="text-blue-600">用户名: <code className="bg-white px-2 py-1 rounded">teacher</code></p>
            <p className="text-blue-600">密码: <code className="bg-white px-2 py-1 rounded">teacher123</code></p>
          </div>
        </div>

        {/* Back to Student Portal */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            返回学生端 →
          </button>
        </div>
      </div>
    </div>
  );
}
