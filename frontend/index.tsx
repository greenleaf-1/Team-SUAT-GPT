import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Send, User, Cpu, Sparkles, Loader2, Layout, 
  MessageCircle, Zap, ShieldCheck, Plus, Settings,
  LogOut, Square, Languages, Paperclip, Database, Globe, HardDrive
} from 'lucide-react';

// --- 类型定义 ---
interface ChatSession { id: string; title: string; }
interface Message { id: string; sender: 'user' | 'ai'; content: string; model?: string; }
interface CustomModel { id: string; name: string; baseUrl: string; apiKey: string; modelId: string; }

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : '/api';

const SafeMarkdown = ({ text }: { text: string }) => {
  if (typeof text !== 'string') return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <div className="message-content">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-[#75207D] font-black">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

const App = () => {
  // --- 状态管理 ---
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [token, setToken] = useState(localStorage.getItem('suat_token'));
  const [user, setUser] = useState(localStorage.getItem('suat_user'));
  const [view, setView] = useState<'chat' | 'login'>(token ? 'chat' : 'login');
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSid, setCurrentSid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('anything-llm');
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModelConfig, setShowModelConfig] = useState(false);
  
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 模型列表 ---
  const MODEL_LIST = [
    { id: 'anything-llm', name: 'SUAT 知识库', icon: <Database size={14}/> },
    { id: 'qwen-internal', name: '内网 Qwen', icon: <HardDrive size={14}/> },
    { id: 'deepseek-internal', name: '内网 DeepSeek', icon: <HardDrive size={14}/> },
    { id: 'qwen-public', name: '公网 Qwen', icon: <Globe size={14}/> },
    { id: 'deepseek-public', name: '公网 DeepSeek', icon: <Globe size={14}/> },
    { id: 'deepseek', name: 'WeKnora 模式', icon: <Zap size={14}/> }
  ];

  const UI = {
    zh: { new: "新会话", stop: "中断", send: "发送", login: "激活终端", reg: "申请权限", logout: "退出", placeholder: "键入指令或上传文档...", success: "同步成功" },
    en: { new: "New Session", stop: "Stop", send: "Send", login: "Auth", reg: "Apply", logout: "Exit", placeholder: "Type or Upload...", success: "Synced" }
  }[lang];

  // --- 副作用 ---
  useEffect(() => { if (token && view === 'chat') fetchSessions(); }, [token, view]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- 逻辑函数 ---
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !currentSid) loadHistory(data[0].id);
      } else if (res.status === 403) handleLogout();
    } catch (e) {}
  };

  const loadHistory = async (sid: string) => {
    setCurrentSid(sid);
    const res = await fetch(`${API_BASE}/ai/history/${sid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.map((m: any) => ({ id: m.id, sender: m.sender.toLowerCase(), content: m.content, model: m.modelKey })));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      const endpoint = isLoginMode ? 'login' : 'register';
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        if (isLoginMode) {
          localStorage.setItem('suat_token', data.token);
          localStorage.setItem('suat_user', authForm.username);
          setToken(data.token); setUser(authForm.username); setView('chat');
        } else {
          setIsLoginMode(true); setAuthError('注册成功，请登录');
        }
      } else { setAuthError(data.message || '认证失败'); }
    } catch (e) { setAuthError('服务器连接超时'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.clear(); setToken(null); setUser(null); setView('login'); setSessions([]); setMessages([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSid) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/ai/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) alert(UI.success);
    } catch (err) { alert("上传失败，请检查服务器内存"); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !currentSid) return;
    const userMsg = input; setInput(''); setIsStreaming(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', content: userMsg }]);
    const aiMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', content: '', model: model }]);
    
    abortControllerRef.current = new AbortController();
    try {
      const res = await fetch(`${API_BASE}/ai/chat/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 确保这里拿到了 token 
          'Authorization': `Bearer ${localStorage.getItem('suat_token')}` 
        },
        body: JSON.stringify({ message: userMsg, modelKey: model, sessionId: currentSid }),
        signal: abortControllerRef.current.signal
      });
const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // AnythingLLM 可能会在一个 chunk 中返回多行，必须按换行符拆分
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          // 关键修复：过滤空行，并确保匹配时不被前导空格干扰
          if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

          const data = trimmedLine.substring(5).trim();
          if (data === '[DONE]') break;

          try {
            const json = JSON.parse(data);
            // 1. 尝试 OpenAI 格式 (AnythingLLM)
            // 2. 尝试 WeKnora 格式 (json.content)
            // 3. 尝试 原生格式 (textResponse)
            const text = json.choices?.[0]?.delta?.content 
                        || (json.response_type === 'answer' ? json.content : "") 
                        || json.textResponse 
                        || "";
            
            if (text) {
              acc += text;
              // 更新 UI...
            }
          } catch (e) {
            // 如果解析失败且不是标识符，作为兜底直接累加原始数据
            if (data && !data.startsWith('{')) {
              acc += data;
              setMessages(prev => 
                prev.map(m => (m.id === aiMsgId ? { ...m, content: acc } : m))
              );
            }
          }
        }
      }
    } catch (e) {
      console.log("Stream ended or aborted:", e);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // --- 渲染逻辑 ---
  if (view === 'login') {
    return (
      <div className="h-screen w-full bg-[#fdfdfe] flex items-center justify-center p-6 font-bold">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border thin-border space-y-8 animate-in zoom-in-95">
          <div className="text-center">
            <ShieldCheck className="w-16 h-16 text-[#75207D] mx-auto mb-4" />
            <h1 className="suat-title text-4xl italic">SUAT-GPT</h1>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="ID (SUAT/XJY/XMU)" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value.toUpperCase()})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-[#75207D]/20 transition-all" required />
            <input type="password" placeholder="KEY" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-[#75207D]/20 transition-all" required />
            {authError && <p className="text-red-500 text-sm text-center uppercase">{authError}</p>}
            <button disabled={authLoading} className="w-full py-5 bg-[#75207D] text-white rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
              {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (isLoginMode ? UI.login : UI.reg)}
            </button>
          </form>
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full text-center text-sm text-gray-400 hover:text-[#75207D]">{isLoginMode ? "申请访问权限" : "返回登录"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white text-[18px]">
      {/* 侧边栏 */}
      <aside className={`flex flex-col bg-[#fcfcfd] border-r transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-8 shrink-0">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#75207D] rounded-xl flex items-center justify-center text-white"><Cpu size={24} /></div>
            <span className="suat-title text-xl font-black">SUAT-GPT</span>
          </div>
          <button onClick={async () => {
             const res = await fetch(`${API_BASE}/ai/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: "New Session" }) });
             if (res.ok) fetchSessions();
          }} className="w-full py-4 bg-[#75207D] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><Plus size={18}/> {UI.new}</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          {sessions.map(s => (
            <button key={s.id} onClick={() => loadHistory(s.id)} className={`w-full text-left p-4 rounded-xl truncate font-bold ${currentSid === s.id ? 'bg-white shadow-sm text-[#75207D]' : 'text-gray-400'}`}>
              <MessageCircle size={16} className="inline mr-2 opacity-50" /> {s.title}
            </button>
          ))}
        </div>
        <div className="p-8 border-t space-y-4">
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center gap-3 text-gray-400 hover:text-[#75207D]"><Languages size={18}/> {lang.toUpperCase()}</button>
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-500"><LogOut size={18}/> {UI.logout}</button>
        </div>
      </aside>

      {/* 主界面 */}
      <main className="flex-1 flex flex-col bg-[#fdfdfe] relative">
        <header className="h-20 flex items-center justify-between px-8 border-b bg-white/50 backdrop-blur-md z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 border rounded-lg text-[#75207D]"><Layout size={20}/></button>
          <div className="text-[12px] opacity-20 font-black tracking-widest uppercase">Agent v5.2 • User: {user}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:px-32 space-y-10 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-[#75207D] text-white' : 'bg-white border text-[#75207D]'}`}>{msg.sender === 'user' ? <User size={24}/> : <Cpu size={24}/>}</div>
                <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-[#75207D] text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                  <SafeMarkdown text={msg.content} />
                  {msg.model && <div className="text-[10px] opacity-30 mt-2 text-right">via {msg.model}</div>}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部控制区 */}
        <div className="p-8 lg:px-32 bg-gradient-to-t from-white to-transparent">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {MODEL_LIST.map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${model === m.id ? 'bg-[#75207D] text-white border-[#75207D]' : 'bg-white text-gray-400'}`}>{m.icon} {m.name}</button>
              ))}
            </div>
            <div className="relative bg-white border rounded-[2rem] p-3 shadow-xl flex items-center gap-4 focus-within:ring-2 ring-[#75207D]/10">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-full hover:bg-gray-50 ${isUploading ? 'animate-spin text-orange-500' : 'text-[#75207D]'}`}><Paperclip size={24}/></button>
              <textarea rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder={UI.placeholder} className="flex-1 p-2 bg-transparent outline-none font-bold resize-none leading-relaxed" />
              <button onClick={sendMessage} className="p-4 bg-[#75207D] text-white rounded-2xl active:scale-90 transition-all">{isStreaming ? <Loader2 className="animate-spin"/> : <Send size={24}/>}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);