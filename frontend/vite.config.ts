import path, { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 🚀 物理对齐：base 设为 './' 是为了让静态资源在宝塔任何目录下都能物理读取
      base: './', 
      
      build: {
        // 🚀 物理扩容：AI 解析可能引入较大的库，将警告阈值调高
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
          // 🚀 物理清单：必须手动列出项目根目录下的每一个 HTML 入口
          input: {
            // 🏠 基础门户
            main: resolve(__dirname, 'index.html'),
            login: resolve(__dirname, 'login.html'),

            // 💼 招聘系统 (Recruit 系列)
            recruit: resolve(__dirname, 'recruit.html'),          // 企业管理端
            'recruit-admin': resolve(__dirname, 'recruit-admin.html'), // SaaS 分身配置厂 (新)
            interview: resolve(__dirname, 'interview.html'),      // 求职应聘端
            'job-detail': resolve(__dirname, 'job-detail.html'),

            // 🔮 咨询系统 (Consult 系列)
            consult: resolve(__dirname, 'consult.html'),          // AI 咨询用户端 (新)
            'consult-admin': resolve(__dirname, 'consult-admin.html'), // AI 咨询管理端 (新)

            // 🎓 教育系统 (Education 系列)
            student: resolve(__dirname, 'student.html'),
            mentor: resolve(__dirname, 'mentor.html'),
            'ai-course': resolve(__dirname, 'ai-course.html'),

            // 💬 聊天系统 (Chat 系列)
            'ai-chat': resolve(__dirname, 'ai-chat.html'),
            'chat-station': resolve(__dirname, 'chat-station.html'),

            // 🛡️ 系统管理 (Admin 系列)
            admin: resolve(__dirname, 'admin.html'),              // 账户巡逻中心 (已拆分)
          },
          // 🚀 物理固化：强制让打包后的文件名保持清晰，方便在宝塔排查问题
          output: {
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          }
        }
      },

      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // 🚀 物理代理：本地调试时转发 API，打包后由 Nginx 接管
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true
          }
        }
      },

      plugins: [react()],

      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});