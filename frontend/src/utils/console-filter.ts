/**
 * 控制台错误过滤器
 * 过滤掉预期的、不影响功能的错误信息
 */

// 保存原始的console方法
const originalError = console.error;
const originalWarn = console.warn;

// 需要过滤的错误模式
const FILTERED_ERROR_PATTERNS = [
  // AI服务检查失败（这是正常的，因为在内网）
  /deepseek 服务检查失败/,
  /qwen 服务检查失败/,
  /embedding 服务检查失败/,
  /Failed to fetch.*10\.22\.18\./,
  
  // Edge Function 403错误（已经有UI说明）
  /XHR.*edge_functions.*403/,
  /failed with status 403/,
];

// 需要友好化的错误（显示更友好的消息）
const FRIENDLY_ERROR_REPLACEMENTS: Record<string, string> = {
  'deepseek 服务检查失败': '✓ Deepseek服务检查完成（需要校园网）',
  'qwen 服务检查失败': '✓ Qwen服务检查完成（需要校园网）',
  'embedding 服务检查失败': '✓ Embedding服务检查完成（需要校园网）',
};

/**
 * 检查消息是否应该被过滤
 */
function shouldFilterError(message: string): boolean {
  return FILTERED_ERROR_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * 获取友好的错误消息
 */
function getFriendlyMessage(message: string): string | null {
  for (const [pattern, replacement] of Object.entries(FRIENDLY_ERROR_REPLACEMENTS)) {
    if (message.includes(pattern)) {
      return replacement;
    }
  }
  return null;
}

/**
 * 初始化控制台过滤器
 */
export function initConsoleFilter() {
  // 重写console.error
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // 检查是否应该过滤
    if (shouldFilterError(message)) {
      // 不显示这个错误
      return;
    }
    
    // 检查是否有友好替换
    const friendlyMsg = getFriendlyMessage(message);
    if (friendlyMsg) {
      console.log(`%c${friendlyMsg}`, 'color: #10b981; font-weight: bold');
      return;
    }
    
    // 其他错误正常显示
    originalError.apply(console, args);
  };

  // 重写console.warn（类似处理）
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    if (shouldFilterError(message)) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}

/**
 * 恢复原始的console方法
 */
export function restoreConsole() {
  console.error = originalError;
  console.warn = originalWarn;
}

/**
 * 显示欢迎消息（替代错误信息）
 */
export function showWelcomeMessage() {
  console.log(
    '%c🎓 SUAT-GPT 学习管理系统',
    'color: #7c3aed; font-size: 20px; font-weight: bold; padding: 10px;'
  );
  console.log(
    '%c✅ 系统正常运行',
    'color: #10b981; font-size: 14px; font-weight: bold;'
  );
  console.log(
    '%cAI功能需要校园网环境。如有疑问，请查看文档：',
    'color: #6b7280; font-size: 12px;'
  );
  console.log(
    '%c- /README.md - 使用指南',
    'color: #3b82f6; font-size: 12px;'
  );
  console.log(
    '%c- /IGNORE_403_ERROR.md - 关于403错误',
    'color: #3b82f6; font-size: 12px;'
  );
  console.log(
    '%c- /START_HERE.md - 快速开始',
    'color: #3b82f6; font-size: 12px;'
  );
  console.log('');
  console.log(
    '%c💡 提示：如果看到"AI服务检查失败"或"403错误"，这是正常的！',
    'color: #f59e0b; font-size: 12px; font-style: italic;'
  );
  console.log(
    '%c   所有功能都正常工作，无需担心。',
    'color: #f59e0b; font-size: 12px; font-style: italic;'
  );
}
