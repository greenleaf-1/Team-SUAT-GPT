import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // 引入 Markdown 渲染库

interface AIResponseProps {
  content: string;
}

export const AIResponse: React.FC<AIResponseProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 解析 <think> 标签的逻辑
  const parseContent = (text: string) => {
    // 兼容 <think> 和 <思考>，以及各种大小写情况
    const regex = /<(think|思考)>([\s\S]*?)<\/(think|思考)>/i;
    const match = text.match(regex);
    
    if (match) {
      return {
        thought: match[2].trim(),
        cleanContent: text.replace(regex, '').trim()
      };
    }
    return { thought: null, cleanContent: text };
  };

  const { thought, cleanContent } = parseContent(content);

  return (
    <div className="w-full text-sm leading-relaxed text-gray-800">
      {/* 1. 思考过程折叠卡片 (只有存在思考内容时才显示) */}
      {thought && (
        <div className="mb-3 rounded-xl border border-purple-200/60 bg-white/60 overflow-hidden">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-800 bg-purple-50/50 hover:bg-purple-100/50 transition-colors"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <BrainCircuit size={14} className="text-purple-600"/>
            {isExpanded ? '深度思考过程' : '点击查看思考过程'}
          </button>
          
          {isExpanded && (
            <div className="p-3 text-xs text-gray-600 font-mono bg-white/40 border-t border-purple-100/50 whitespace-pre-wrap leading-relaxed">
              {thought}
            </div>
          )}
        </div>
      )}

      {/* 2. Markdown 渲染区 (核心修改：用 ReactMarkdown 替换了原来的 p 标签) */}
      <div className="markdown-body">
        <ReactMarkdown
          components={{
            // --- 自定义样式映射 (适配你的紫色主题) ---
            
            // 列表：增加缩进和圆点
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-4 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-4 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            
            // 标题：加粗并使用紫色
            h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-3 text-purple-900 border-b pb-1" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-2 text-purple-800" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2 text-gray-800" {...props} />,
            
            // 段落：增加行高和间距
            p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-7" {...props} />,
            
            // 加粗：使用紫色高亮
            strong: ({node, ...props}) => <strong className="font-bold text-purple-900" {...props} />,
            
            // 代码块：使用等宽字体和背景色
            code: ({node, ...props}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />,
            
            // 引用块
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 pl-4 py-1 my-3 bg-purple-50 italic text-gray-600" {...props} />,
            
            // 链接
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer" {...props} />,
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};