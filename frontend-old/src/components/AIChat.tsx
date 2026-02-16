import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2, Download } from 'lucide-react';
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

const AI_MODELS = [
  { id: 'qwen-internal', name: 'Qwen3-30B (内网)', description: '校内高性能模型' },
  { id: 'qwen-public', name: 'Qwen Max (公网)', description: '阿里云通义千问 Max' },
  { id: 'deepseek', name: 'DeepSeek-R1', description: '深度推理模型' },
] as const;

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [selectedModel, setSelectedModel] =
      useState<'deepseek' | 'qwen-internal' | 'qwen-public'>('qwen-internal');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ==========================
  // 1️⃣ 加载历史记录
  // ==========================
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = (await getChatHistory()) as any[];
        const formatted: Message[] = history.map((m: any) => ({
          id: String(m.id ?? Date.now()),
          content: String(m.content ?? ''),
          sender:
              String(m.sender).toUpperCase() === 'USER'
                  ? 'user'
                  : 'ai',
          timestamp: new Date(m.timestamp ?? Date.now()),
        }));

        if (formatted.length === 0) {
          formatted.push({
            id: Date.now().toString(),
            content:
                '你好！我是 SUAT-GPT 助手。\n(提示：选择 DeepSeek-R1 可以体验深度思考功能)',
            sender: 'ai',
            timestamp: new Date(),
          });
        }

        setMessages(formatted);
      } catch (err) {
        console.error('加载历史失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // ==========================
  // 2️⃣ 自动滚动
  // ==========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================
  // 3️⃣ 核心流式发送逻辑
  // ==========================
  const handleSend = async () => {
    if (!inputValue.trim() || isAIThinking) return;

    const currentInput = inputValue;
    setInputValue('');
    setIsAIThinking(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    const aiMsgId = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      {
        id: aiMsgId,
        content: '',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);

    try {
      const token =
          localStorage.getItem('token') ||
          localStorage.getItem('auth_token');

      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const content = line.slice(5);
            accumulatedContent += content.length === 0 ? '\n' : content;
          }
        }

        setMessages(prev =>
            prev.map(msg =>
                msg.id === aiMsgId
                    ? { ...msg, content: accumulatedContent }
                    : msg
            )
        );
      }
    } catch (error: any) {
      console.error('Stream error:', error);
      setMessages(prev =>
          prev.map(msg =>
              msg.id === aiMsgId
                  ? {
                    ...msg,
                    content:
                        msg.content +
                        `\n\n[系统错误: ${error.message}]`,
                  }
                  : msg
          )
      );
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
      <div className="flex flex-col h-full bg-white">

        {/* 顶部模型选择 */}
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            {AI_MODELS.map(model => (
                <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id as any)}
                    className={`px-3 py-1 text-xs rounded ${
                        selectedModel === model.id
                            ? 'bg-purple-900 text-white'
                            : 'bg-gray-100'
                    }`}
                >
                  {model.name}
                </button>
            ))}
          </div>
        </div>

        {/* 消息区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map(message => (
              <div
                  key={message.id}
                  className={`flex ${
                      message.sender === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                  }`}
              >
                <div
                    className={`max-w-2xl p-4 rounded-xl ${
                        message.sender === 'user'
                            ? 'bg-purple-900 text-white'
                            : 'bg-gray-100'
                    }`}
                >
                  {message.sender === 'ai' ? (
                      <>
                        <AIResponse content={message.content} />

                        {/* 保留日记下载逻辑 */}
                        {message.content.includes('✅ 日记已保存') && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() =>
                                    window.open(
                                        `/api/ai/diary/download/diary_${new Date()
                                            .toISOString()
                                            .split('T')[0]}.md`
                                    )
                                }
                            >
                              <Download className="w-4 h-4 mr-2" />
                              下载日记
                            </Button>
                        )}
                      </>
                  ) : (
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                  )}

                  <div className="text-xs mt-1 opacity-50">
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
          ))}

          {isAIThinking && (
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在连接大脑...
              </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="p-4 border-t flex gap-2">
          <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isAIThinking}
              placeholder="输入消息..."
          />
          <Button
              onClick={handleSend}
              disabled={isAIThinking || !inputValue.trim()}
          >
            {isAIThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Send size={18} />
            )}
          </Button>
        </div>
      </div>
  );
}
