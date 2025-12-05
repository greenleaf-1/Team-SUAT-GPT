/**
 * AI聊天API封装
 * 支持模型切换和JWT认证
 */

import { API_CONFIG, buildUrl, API_ENDPOINTS } from '../utils/api-config';

// 模型键映射
export type ModelKey = 'qwen-internal' | 'qwen-public';

// 聊天请求接口
export interface ChatRequest {
  content: string;
  modelKey: ModelKey;
}

// 聊天响应接口
export interface ChatResponse {
  success: boolean;
  message?: string;
  content?: string;
  timestamp?: string;
}

/**
 * 从localStorage获取JWT Token
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * 发送聊天消息到后端
 * @param content 用户输入的聊天消息
 * @param modelKey 用户选择的模型键 ('qwen-internal' | 'qwen-public')
 * @returns Promise<ChatResponse>
 */
export async function sendChatMessage(
  content: string,
  modelKey: ModelKey
): Promise<ChatResponse> {
  try {
    // 1. 获取JWT Token
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('未找到认证令牌，请先登录');
    }

    // 2. 构建请求
    const url = buildUrl(API_ENDPOINTS.AI.CHAT);
    
    console.log('📤 发送聊天请求:', {
      url,
      content: content.substring(0, 50) + '...',
      modelKey,
    });

    // 3. 发送请求（后端期望字段为 message）
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: content,
        modelKey,
      }),
    });

    // 4. 处理响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `请求失败: ${response.status} ${response.statusText}`
      );
    }

    // 后端返回结构: { sender, content, timestamp }
    const raw = await response.json();

    const data: ChatResponse = {
      success: true,
      message: raw.message || raw.content || undefined,
      content: raw.content || raw.message || undefined,
      timestamp: raw.timestamp || new Date().toISOString(),
    };

    console.log('✅ 聊天响应成功:', {
      sender: raw.sender,
      contentLength: data.content?.length || 0,
    });

    return data;
    
  } catch (error: any) {
    console.error('❌ 发送聊天消息失败:', error);
    throw error;
  }
}

/**
 * 获取聊天历史记录
 */
export async function fetchChatHistory(): Promise<any[]> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.warn('⚠️ 未登录，无法获取聊天历史');
      return [];
    }

    const url = buildUrl(API_ENDPOINTS.AI.CHAT_HISTORY);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取聊天历史失败: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || data || [];
    
  } catch (error: any) {
    console.error('❌ 获取聊天历史失败:', error);
    return [];
  }
}

/**
 * 清除聊天历史
 */
export async function clearChatHistory(): Promise<boolean> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const url = buildUrl(API_ENDPOINTS.AI.CHAT_HISTORY);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`清除历史失败: ${response.status}`);
    }

    return true;
    
  } catch (error: any) {
    console.error('❌ 清除聊天历史失败:', error);
    throw error;
  }
}

/**
 * 模型配置信息
 */
export const MODEL_CONFIGS = {
  'qwen-internal': {
    name: 'Qwen (内网)',
    description: '校园网专用，高性能AI模型',
    icon: '🏫',
    requiresIntranet: true,
  },
  'qwen-public': {
    name: 'Qwen (公网)',
    description: '公网可用，适合校外访问',
    icon: '🌐',
    requiresIntranet: false,
  },
} as const;
