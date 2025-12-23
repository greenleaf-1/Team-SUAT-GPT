import { useState } from 'react';
import { ArrowLeft, Sparkles, BookOpen, PenTool } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

type Course = {
  id: string;
  name: string;
  code: string;
};

type CourseAIProps = {
  course: Course;
  onBack: () => void;
};

export function CourseAI({ course, onBack }: CourseAIProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

  const handleAsk = () => {
    if (!question.trim()) return;

    setMessages([...messages, { role: 'user', content: question }]);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(question);
      setMessages((prev) => [...prev, { role: 'ai', content: response }]);
    }, 500);

    setQuestion('');
  };

  const generateAIResponse = (q: string) => {
    const lowerQ = q.toLowerCase();
    
    if (lowerQ.includes('总结') || lowerQ.includes('章节')) {
      return `关于${course.name}的本章总结：\n\n1. 核心概念：本章介绍了函数、极限、连续性等基本概念\n2. 重点定理：极限的四则运算法则、夹逼定理\n3. 典型例题：求各类函数的极限\n4. 常见错误：忽略函数定义域、混淆左右极限\n\n建议重点复习极限的计算方法和连续性判断。`;
    }
    
    if (lowerQ.includes('练习') || lowerQ.includes('题目')) {
      return `已为您生成${course.name}练习题：\n\n1. 求极限：lim(x→∞) (2x²+3x+1)/(x²-x)\n2. 判断函数 f(x)=(x²-1)/(x-1) 在 x=1 处的连续性\n3. 证明：lim(x→0) sin(x)/x = 1\n4. 求函数 f(x)=|x| 在 x=0 处的左右极限\n\n建议先自己尝试解答，遇到困难可以询问我！`;
    }
    
    return `关于您的问题"${q}"：\n\n这是一个很好的问题。在${course.name}中，我们需要理解核心概念并通过大量练习来巩固。建议您：\n\n1. 复习相关章节的理论知识\n2. 查看例题的详细解答过程\n3. 尝试做章节练习题\n4. 如有疑问随时向我提问\n\n还有什么我可以帮助您的吗？`;
  };

  const handleQuickAction = (action: string) => {
    setQuestion(action);
    handleAsk();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <h2>{course.name} - AI助手</h2>
            <p className="text-gray-600">智能课程辅导</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-purple-900" size={20} />
          <span className="text-gray-700">快速功能</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction('请总结本节内容')}
            className="px-3 py-1.5 bg-purple-50 text-purple-900 rounded-full hover:bg-purple-100 transition-colors"
          >
            <BookOpen className="inline mr-1" size={16} />
            本节总结
          </button>
          <button
            onClick={() => handleQuickAction('请为我生成练习题')}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            <PenTool className="inline mr-1" size={16} />
            自动生成练习题
          </button>
          <button
            onClick={() => handleQuickAction('什么是极限？')}
            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
          >
            课程知识问答
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-purple-900" size={32} />
              </div>
              <h3 className="mb-2">AI课程助手</h3>
              <p className="text-gray-600">
                我可以帮您总结课程内容、生成练习题、解答知识点疑问
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      msg.role === 'ai' ? 'bg-purple-900 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {msg.role === 'ai' ? 'AI' : '我'}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-purple-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入您的问题..."
            className="min-h-[80px]"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <Button onClick={handleAsk} className="w-full bg-purple-900 hover:bg-purple-800">
            发送问题
          </Button>
        </div>
      </div>
    </div>
  );
}
