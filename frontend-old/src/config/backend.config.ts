// ========================================
// 后端配置文件
// ========================================
// 这个文件用于配置前端连接到哪个后端服务器
// 修改 BACKEND_TYPE 可以切换后端类型

export type BackendType = 'java' | 'supabase';

// ⚠️ 重要：修改这里切换后端类型
export const BACKEND_TYPE: BackendType = 'java';

// Java 后端配置
export const JAVA_BACKEND_CONFIG = {
  // TODO: 修改为您的Java后端地址
  baseUrl: 'http://localhost:8080/api',  // 本地开发
  // baseUrl: 'http://your-server-ip:8080/api',  // 生产环境
  
  // 超时时间（毫秒）
  timeout: 10000,
  
  // 是否启用认证
  enableAuth: true,
};

// Supabase 后端配置（备用）
export const SUPABASE_BACKEND_CONFIG = {
  enabled: false,
  // Supabase配置将从 /utils/supabase/info.tsx 读取
};

// 获取当前后端配置
export function getBackendConfig() {
  if (BACKEND_TYPE === 'java') {
    return {
      type: 'java' as const,
      baseUrl: JAVA_BACKEND_CONFIG.baseUrl,
      timeout: JAVA_BACKEND_CONFIG.timeout,
    };
  } else {
    return {
      type: 'supabase' as const,
      baseUrl: '', // 将由api.ts动态设置
      timeout: 10000,
    };
  }
}

// 开发提示
console.log(`
🔧 当前后端配置:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  类型: ${BACKEND_TYPE}
  地址: ${BACKEND_TYPE === 'java' ? JAVA_BACKEND_CONFIG.baseUrl : 'Supabase Edge Functions'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${BACKEND_TYPE === 'java' ? `
⚠️  Java 后端模式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
请确保您的 Java 后端已启动并运行在:
${JAVA_BACKEND_CONFIG.baseUrl}

如果后端未启动，请参考 /docs/JAVA_BACKEND_API.md
` : `
✅  Supabase 后端模式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
使用云端 Supabase 服务，无需额外配置
`}
`);
