import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getChatHistory, sendAIChatMessage } from '../utils/api-new';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type AIModel = 'deepseek' | 'qwen-internal' | 'qwen-public' | 'embedding';

const AI_MODELS = [
  { id: 'qwen-public', name: 'Qwen Max (公网)', description: '公网可访问的Qwen Max' },
  { id: 'qwen-internal', name: 'Qwen3-30B (内网)', description: '校内高性能模型' },
  { id: 'deepseek', name: 'DeepSeek-R1', description: '深度推理模型' },
  { id: 'embedding', name: 'Qwen Embedding', description: '向量嵌入模型' },
] as const;

const AI_FEATURES = [
  '查询课程信息',
  '查询上课时间',
  '查询考试日期',
  '查询所有DDL',
  '知识问答',
  '题目解析与讲解',
  '生成学习计划',
  '文档总结',
  '自动出题',
  '学习数据查询',
  '作业分析',
  '日程提醒',
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  // Default to internal Qwen (qwen-internal)
  const [selectedModel, setSelectedModel] = useState<'deepseek' | 'qwen-internal' | 'qwen-public'>('qwen-internal');

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = (await getChatHistory()) as any[];
        // 转换时间戳为 Date 对象
        const formattedMessages: Message[] = history.map((msg: any) => ({
          id: String(msg.id ?? Date.now()),
          content: String(msg.content ?? ''),
          sender: (String(msg.sender).toLowerCase() === 'user' || String(msg.sender).toUpperCase() === 'USER') ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp ?? Date.now()),
        }));
        setMessages(formattedMessages);
        
        // 如果没有历史消息，添加欢迎消息
        if (formattedMessages.length === 0) {
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: '你好！我是SUAT-GPT助手，搭载Qwen3-30B-A3B AI模型。我可以帮你解答各种学习问题、分析课程内容、制定学习计划等。有什么可以帮你？',
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // 如果加载失败，显示欢迎消息
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: '你好！我是SUAT-GPT助手，搭载Qwen3-30B-A3B AI模型。我可以帮你解答各种学习问题、分析课程内容、制定学习计划等。有什么可以帮你？',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } finally {
        setLoading(false);
      }
    };
    loadChatHistory();
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAIThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);

    // 清空输入框并设置思考状态
    const currentInput = inputValue;
    setInputValue('');
    setIsAIThinking(true);

    // 调用真实AI服务
    try {
      // 准备对话历史（仅包含最近10条对话）
      const conversationHistory = messages.slice(-10).map((msg: Message) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      // 调用后端API获取AI回答
      const response = await sendAIChatMessage({
        message: currentInput,
        model: selectedModel,
        conversationHistory: conversationHistory,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: String(response?.response ?? ''),
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev: Message[]) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI服务调用失败:', error);
      
      // 如果AI服务失败，使用友好的错误提示
      // If 403 Forbidden, likely missing or invalid token -> ask user to login
      const isForbidden = String(error.message || '').includes('403') || (error.status === 403);

      const errorContent = isForbidden
        ? '❌ AI服务需要登录（403）。请先登录并确保页面已保存登录令牌，然后重试。'
        : `❌ AI服务连接失败：${error.message || '未知错误'}。请检查后端是否运行并在浏览器控制台查看详细信息。`;

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-900" />
          <p className="text-gray-500">加载聊天历史中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Quick Actions */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        {/* 模型选择器 */}
        <div className="mb-3 flex items-center gap-2 pb-3 border-b border-gray-100">
          <span className="text-sm text-gray-600">选择模型：</span>
          <div className="flex gap-2">
            {AI_MODELS.slice(0, 3).map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id as 'deepseek' | 'qwen-internal' | 'qwen-public')}
                className={`px-3 py-1 text-sm rounded-lg transition-all ${
                  selectedModel === model.id
                    ? 'bg-purple-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={model.description}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-purple-900" size={20} />
          <span className="text-gray-700">快速功能</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['查询课程信息', '查询考试日期', '查询所有DDL', '生成学习计划'].map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={isAIThinking}
              className="px-3 py-1.5 bg-purple-50 text-purple-900 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  message.sender === 'ai' ? 'bg-purple-900 text-white' : 'bg-gray-200'
                }`}
              >
                {message.sender === 'ai' ? '深' : '我'}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-purple-900 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          {isAIThinking && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-purple-900 text-white">
                深
              </div>
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-gray-600">AI正在思考...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Send Messages"
            className="flex-1"
            disabled={isAIThinking}
          />
          <Button 
            onClick={handleSend} 
            className="bg-purple-900 hover:bg-purple-800"
            disabled={isAIThinking || !inputValue.trim()}
          >
            {isAIThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
}