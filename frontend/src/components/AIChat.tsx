import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AIResponse } from './AIResponse'; 
import { getChatHistory } from '../utils/api-new';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// 定义模型列表
const AI_MODELS = [
  { id: 'qwen-internal', name: 'Qwen3-30B (内网)', description: '校内高性能模型' },
  { id: 'qwen-public', name: 'Qwen Max (公网)', description: '阿里云通义千问 Max' },
  { id: 'deepseek', name: 'DeepSeek-R1', description: '深度推理模型' },
] as const;

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<'deepseek' | 'qwen-internal' | 'qwen-public'>('qwen-internal');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. 加载历史记录
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = (await getChatHistory()) as any[];
        const formattedMessages: Message[] = history.map((msg: any) => ({
          id: String(msg.id ?? Date.now()),
          content: String(msg.content ?? ''),
          sender: (String(msg.sender).toLowerCase() === 'user' || String(msg.sender).toUpperCase() === 'USER') ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp ?? Date.now()),
        }));
        setMessages(formattedMessages);
        
        if (formattedMessages.length === 0) {
          setMessages([{
            id: Date.now().toString(),
            content: '你好！我是SUAT-GPT助手。我可以帮你解答学习问题、分析课程内容等。\n(提示：选择 DeepSeek-R1 模型可以体验深度思考功能)',
            sender: 'ai',
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChatHistory();
  }, []);

  // 2. 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 核心：流式发送逻辑 (增加 Buffer 缓存机制，防止闪退) ---
  const handleSend = async () => {
    if (!inputValue.trim() || isAIThinking) return;

    const currentInput = inputValue;
    setInputValue(''); 
    setIsAIThinking(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = {
      id: aiMsgId,
      content: '', 
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiPlaceholder]);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: currentInput,
          modelKey: selectedModel,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`连接失败 (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // === 🚀 关键改进：增加 buffer 处理粘包/断包问题 ===
      let accumulatedContent = ''; 
      let buffer = ''; // 缓存桶，暂存不完整的行

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 1. 解码当前收到的数据块
        const chunk = decoder.decode(value, { stream: true });
        
        // 2. 拼接到缓存桶里
        buffer += chunk;
        
        // 3. 按换行符切分 (可能最后一行是不完整的，要留到下一次)
        const lines = buffer.split('\n');
        
        // 保留最后一行（因为它可能没传完），只处理前面的完整行
        buffer = lines.pop() || ''; 

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const content = line.slice(5); // 去掉 "data:"
            // 处理换行
            if (content.length === 0) {
              accumulatedContent += '\n';
            } else {
              accumulatedContent += content;
            }
          }
        }

        // 4. 更新 UI
        setMessages((prev) => {
          return prev.map((msg) => 
            msg.id === aiMsgId ? { ...msg, content: accumulatedContent } : msg
          );
        });
      }

    } catch (error: any) {
      console.error('Stream error:', error);
      setMessages((prev) => prev.map((msg) => 
        msg.id === aiMsgId 
          ? { ...msg, content: msg.content + `\n\n[系统错误: ${error.message}]` } 
          : msg
      ));
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 顶部：模型与快捷指令 */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 pb-3 border-b border-gray-100">
          <span className="text-sm text-gray-600 font-medium">✨ 选择模型：</span>
          <div className="flex gap-2">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                  selectedModel === model.id
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
                title={model.description}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
          <Sparkles className="text-purple-600 flex-shrink-0" size={16} />
          <span className="text-xs text-gray-500 font-medium">快捷指令：</span>
          <div className="flex gap-2">
            {['查询课程信息', '查询DDL', '生成学习计划', '解释一下CRISPR'].map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isAIThinking}
                className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors whitespace-nowrap"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* 头像 */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
                  message.sender === 'ai' 
                    ? 'bg-purple-900 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {message.sender === 'ai' ? '深' : '我'}
              </div>

              {/* 气泡内容 */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-purple-900 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}
              >
                {/* 只有 AI 消息才使用 AIResponse 组件处理 <think> 和 Markdown */}
                {message.sender === 'ai' ? (
                  <AIResponse content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                )}
                
                <span className={`text-[10px] mt-1 block ${message.sender === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading 状态 */}
          {isAIThinking && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-900 text-white flex items-center justify-center">
                深
              </div>
              <div className="text-xs text-gray-500 flex items-center h-10 px-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                正在连接大脑...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入框 */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSend(); 
              } 
            }}
            placeholder={isAIThinking ? "AI 正在回复中..." : "输入消息..."}
            className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            disabled={isAIThinking}
          />
          <Button 
            onClick={handleSend} 
            disabled={isAIThinking || !inputValue.trim()}
            className={`bg-purple-900 hover:bg-purple-800 transition-all ${isAIThinking ? 'opacity-50' : ''}`}
          >
            {isAIThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
        <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">Powered by SUAT-GPT Backend • Stream Mode Active</span>
        </div>
      </div>
    </div>
  );
}