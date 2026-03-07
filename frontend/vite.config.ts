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
            main: resolve(__dirname, 'index.html'),
            login: resolve(__dirname, 'login.html'),
            recruit: resolve(__dirname, 'recruit.html'),
            admin: resolve(__dirname, 'admin.html'),
            interview: resolve(__dirname, 'interview.html'),
            student: resolve(__dirname, 'student.html'),
            mentor: resolve(__dirname, 'mentor.html'),
            'ai-chat': resolve(__dirname, 'ai-chat.html'),
            'ai-course': resolve(__dirname, 'ai-course.html'),
            'chat-station': resolve(__dirname, 'chat-station.html'),
            'job-detail': resolve(__dirname, 'job-detail.html')
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