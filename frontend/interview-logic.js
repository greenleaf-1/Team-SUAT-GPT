/**
 * 🚀 SUAT 物理合拢版：OpenClaw 驱动的应聘者工作站逻辑
 * 流程：公告选择 -> 简历直传 OpenClaw -> 全量笔试 -> 15轮深度面试
 */

/**
 * 🚀 物理链路自修复：无论域名还是本地，精准锁定后端
 */
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : `${window.location.protocol}//${window.location.host}/api`;

// 🚀 核心修复：移除重复斜杠的辅助函数
const cleanUrl = (path) => path.replace(/([^:]\/)\/+/g, "$1");

async function fetchActiveJobs() {
    const targetUrl = `${API_BASE}/recruit/job-stats`.replace(/([^:]\/)\/+/g, "$1");
    console.log("🛰️ 物理雷达正在扫描:", targetUrl);
    
    try {
        const res = await axios.get(targetUrl, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        console.log("📥 物理收信成功，原始数据:", res.data);

        // 🚀 强制纠偏：如果后端返回的是空，给出物理警告
        if (!res.data || res.data.length === 0) {
            document.getElementById('job-list').innerHTML = `
                <div class="p-8 text-center border-2 border-dashed rounded-3xl text-slate-400">
                    ⚠️ 物理同步成功但数据为空。<br>请检查部长端是否已点击“正式发布”且状态为 OPEN。
                </div>`;
            return;
        }

        const jobs = res.data;
        document.getElementById('job-count').innerText = jobs.length;
        
        // 渲染逻辑...
        document.getElementById('job-list').innerHTML = jobs.map(j => {
            jobCache[j.id] = j;
            return `
                <div onclick="handleJobClick(${j.id})" 
                     class="p-6 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer">
                    <h3 class="font-black text-xl text-slate-800">${j.title}</h3>
                    <p class="text-slate-400 text-sm mt-2">点击查阅详情 →</p>
                </div>`;
        }).join('');
    } catch (e) {
        console.error("🔥 物理链路崩溃！", e);
        alert("链路异常，请查看 F12 Console");
    }
}

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

// ---------------------------------------------------------
// 物理工具函数
// ---------------------------------------------------------
function appendBubble(role, text) {
    const win = document.getElementById('chat-window');
    if (!win) return;
    const div = document.createElement('div');
    div.className = role === 'candidate' ? 'flex justify-end' : 'flex justify-start';
    div.innerHTML = `
        <div class="max-w-[85%] p-4 rounded-2xl ${role === 'candidate' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-800 shadow-sm'}">
            <p class="whitespace-pre-wrap text-sm leading-relaxed">${text}</p>
        </div>
    `;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

/**
 * 🚀 SUAT 万能切页中枢 (放在文件最顶部)
 */
function switchView(step) {
    console.log("🔄 物理切页指令:", step);
    
    // 1. 隐藏所有 section
    document.querySelectorAll('section').forEach(s => {
        s.classList.add('step-inactive');
        s.style.display = 'none'; // 双重保险
    });

    // 2. 激活目标
    const targetEl = document.getElementById(`step-${step}`);
    if (targetEl) {
        targetEl.classList.remove('step-inactive');
        targetEl.style.display = 'block';
        
        // 3. 物理同步导航栏高亮
        updateStepTags(step);
        window.scrollTo(0, 0);
    } else {
        console.error("❌ 物理故障：找不到 step-" + step);
    }
}

function updateStepTags(currentStep) {
    [1, 2, 3, 4, 5].forEach(i => {
        const tag = document.getElementById(`step-tag-${i}`);
        if (tag) {
            tag.className = (i === currentStep) 
                ? 'flex flex-col items-center gap-1 transition-all text-purple-600 font-black' 
                : 'flex flex-col items-center gap-1 transition-all text-slate-300';
        }
    });
}

// 🚀 核心业务状态机
let state = {
    currentJob: null,
    fileName: null,
    step: 1,
    questions: [],
    chatCount: 1,
    history: "",
    isLocked: false
};

// 1. 初始化
window.onload = async () => {
    // 🚀 物理拦截：如果没有主系统的 Token，直接打回登录页，而不是弹出二次登录
    const mainToken = localStorage.getItem('token');
    const mainUser = localStorage.getItem('username');

    if (!mainToken) {
        window.location.href = 'login.html?redirect=interview.html';
        return;
    }
    
    // 自动物理同步身份
    state.username = mainUser; 
    console.log("✅ 身份已自动同步自系统主账户:", mainUser);
    
    fetchActiveJobs();
};

// ---------------------------------------------------------
// STEP 1: 岗位加载逻辑
// ---------------------------------------------------------
// 🚀 物理直达：点击后直接带上 ID 跳到新页面
// 🚀 建立物理内存索引
let jobCache = {}; 

// 🚀 新的点击处理器：通过 ID 从内存拿超长字符串，避开 HTML 限制
function handleJobClick(jobId) {
    const job = jobCache[jobId];
    if (!job) return;
    
    console.log("🎯 选中岗位，从物理内存提取成功");
    state.currentJob = job;
    
    document.getElementById('current-job-title').innerText = job.title;
    // 物理解决：这里能撑住几万字的 LONGTEXT
    document.getElementById('current-job-ad').innerHTML = (job.adText || "暂无详情").replace(/\n/g, '<br>');
    
    switchView(2); // 现在 switchView 已经在顶部定义好了，绝对能点开！
}

// ---------------------------------------------------------
// STEP 2: 简历直传 OpenClaw (物理唯一上传点)
// ---------------------------------------------------------
async function uploadResume(input) {
    const file = input.files[0];
    
    // 1. 物理检查
    if(!file || !state.currentJob) {
        alert("请先选择岗位");
        return;
    }
    
    // 2. 获取身份与邮箱
    const name = state.candidateName || prompt("请输入您的真实姓名：");
    const email = state.candidateEmail || prompt("请输入接收录取通知的邮箱：");

    if(!name || !email) return;
    state.candidateName = name;
    state.candidateEmail = email;

    // 3. 🚀 关键修复：在这里定义 formData，确保它在当前作用域内物理存在
    const formData = new FormData(); 
    formData.append('file', file);
    formData.append('jobId', state.currentJob.id);
    formData.append('candidateName', name);
    formData.append('email', email); 
    
    // 🚀 2. 视觉反馈增强
    const uploadBtn = document.getElementById('upload-btn');
    const loadingOverlay = document.getElementById('upload-loading');
    
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> 正在物理上传并解析...`;
    }
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.querySelector('span').innerText = "AI 正在深度解析简历（预计 10-15 秒）...";
    }

    try {
        // 使用 fetch 模拟物理传输
        const res = await fetch(`${API_BASE}/interview/upload`, {
            method: 'POST',
            body: formData
            // 注意：此处绝对不能手动设置 Content-Type 头
        });
        
        const data = await res.json();

        if (res.ok && data.code === 200) {
            state.recordId = data.recordId; 
            state.fileName = data.fileName;
            
            alert("🎉 报名成功！简历已同步至部长指挥台。");
            
            // 🚀 物理修正：跳转到 step-4 (专家面试)
            switchView(4); 
            
            appendBubble("interviewer", "【OpenClaw 简历评估报告】\n" + data.analysis);
            state.history = "简历评估: " + data.analysis + "\n";
        } else {
            throw new Error(data.error || "后端拒绝处理");
        }
    } catch (e) {
        console.error("🔥 上传物理中断:", e);
        alert("❌ 链路异常: " + e.message);
    } finally {
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerText = "重新上传简历";
        }
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

// 辅助函数：显示全局加载状态
function showLoadingOverlay(msg) {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm";
        loader.innerHTML = `
            <div class="bg-white p-8 rounded-3xl text-center shadow-2xl">
                <div class="inline-block animate-spin mb-4 text-4xl">🦞</div>
                <div class="text-purple-700 font-bold">${msg}</div>
            </div>
        `;
        document.body.appendChild(loader);
    }
}

function hideLoadingOverlay() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
}

// ---------------------------------------------------------
// STEP 3: 全量笔试 (物理铺场模式)
// ---------------------------------------------------------
async function fetchAllQuestions() {
    const paper = document.getElementById('exam-paper');
    try {
        const res = await fetch(`${API_BASE}/interview/generate-full-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ jobId: state.currentJob.id, fileName: state.fileName })
        });
        const data = await res.json();
        
        // 物理拆箱：确保拿到题目数组
        state.questions = data.questions || (Array.isArray(data) ? data : []);
        
        paper.innerHTML = state.questions.map((q, index) => {
            const qText = typeof q === 'object' ? (q.content || q.question) : q;
            return `
                <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                    <p class="text-slate-800 font-bold"><span class="text-purple-600 mr-2">Q${index+1}</span> ${qText}</p>
                    <textarea id="ans-${index}" class="w-full p-4 border rounded-xl h-32 focus:ring-2 ring-purple-200 outline-none transition-all" placeholder="请输入专业见解..."></textarea>
                </div>
            `;
        }).join('');
    } catch (e) {
        paper.innerHTML = `<div class="text-red-500">笔试题物理生成故障。</div>`;
    }
}

async function submitFullPaper() {
    const answers = state.questions.map((_, i) => ({
        q: i + 1,
        a: document.getElementById(`ans-${i}`).value.trim()
    }));

    if (answers.some(ans => !ans.a)) return alert("请完成所有题目后再提交。");

    try {
        const res = await fetch(`${API_BASE}/interview/evaluate-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ jobId: state.currentJob.id, answers: answers, username: username })
        });
        if (res.ok) {
            alert("🎉 笔试评价已物理归档，进入专家面试环节。");
            switchView(4);
            // 启动面试时，可以把笔试成绩作为背景传入 history
            startOpenClawInterview("考生已完成笔试。");
        }
    } catch (e) {
        alert("评估上传失败。");
    }
}

// ---------------------------------------------------------
// STEP 4: OpenClaw 实时面试 (15轮压迫追问)
// ---------------------------------------------------------
function startOpenClawInterview(initialText) {
    appendBubble("interviewer", initialText || "你好，我是面试官。请问你准备好了吗？");
}



async function sendMessage() {
    const input = document.getElementById('user-input');
    const msg = document.getElementById('user-input').value.trim();
    
    const payload = {
        recordId: state.recordId,
        message: msg,
        // 🚨 检查这里：state.currentJob.title 是否真的有值？
        jobTitle: state.currentJob ? state.currentJob.title : "教育专家", 
        chatCount: state.chatCount
    };
    
    console.log("📡 物理外发载荷:", payload); // 在 F12 控制台看一眼这个 title 是不是“未知”    
    // 🚀 核心检查：如果没有档案 ID，监控信号无法对齐
    if (!msg || !state.recordId) return alert("❌ 面试信号源异常，请重新上传简历。");

    appendBubble("candidate", msg);
    input.value = "";

    try {
        const res = await fetch(`${API_BASE}/interview/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // 🚀 只要这一行，别加其他的
            body: JSON.stringify({
                recordId: state.recordId,
                message: msg,
                jobTitle: payload.jobTitle,
                chatCount: payload.chatCount
            })
        });
        const data = await res.json();
        appendBubble("interviewer", data.reply);
        
        // 发送完后检测一下入职状态
        checkHiredStatus();
    } catch (e) {
        appendBubble("system", "❌ 信号物理掉线...");
    }
}

/**
 * 🛰️ 物理切页中枢
 * 作用：在【职位列表】、【岗位详情】、【在线面试】等视图间物理切换
 */


// 🛰️ 物理状态雷达：感知部长的录用指令
async function checkHiredStatus() {
    try {
        const res = await fetch(`${API_BASE}//interview/candidate/${state.recordId}`);
        const data = await res.json();
        if (data.status === 'HIRED') {
            const chatWindow = document.getElementById('chat-window');
            chatWindow.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full space-y-6 animate-bounce">
                    <span class="text-8xl">🎊</span>
                    <h1 class="text-4xl font-bold text-green-600">录用成功！</h1>
                    <p class="text-gray-500 text-lg text-center">入职通知已物理发送至您的教育邮箱。<br>请关注后续通知。</p>
                    <button onclick="window.location.reload()" class="bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg">进入系统</button>
                </div>
            `;
        }
    } catch (e) { console.log("静默心跳异常"); }
}

function updateCandidateUI(status) {
    const statusTag = document.getElementById('status-tag');
    if (status === 'HIRED') {
        statusTag.innerHTML = "🎊 <span class='text-green-600 font-bold'>您已正式入职</span>";
        // 锁定面试入口，防止重复面试
        document.getElementById('chat-input').disabled = true;
        document.getElementById('chat-input').placeholder = "面试已圆满结束，欢迎加入！";
    }
}

// 在应聘端的定时状态检查中加入
async function checkStatus() {
    const res = await fetch(`${API_BASE}//interview/candidate-status?name=${username}`);
    const data = await res.json();
    
    if (data.status === 'HIRED') {
        const chatArea = document.getElementById('chat-window');
        // 🚀 物理覆盖：显示入职喜报
        chatArea.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full space-y-4">
                <div class="text-6xl animate-bounce">🎊</div>
                <h2 class="text-2xl font-bold text-green-600">恭喜入职！</h2>
                <p class="text-gray-500">录用通知书已物理发送至您的教育邮箱。</p>
                <button onclick="location.reload()" class="px-6 py-2 bg-green-500 text-white rounded-full">进入员工系统</button>
            </div>
        `;
    }


// 在处理 AI 回复的逻辑中（比如 appendBubble 或 sendMessage 成功后）
function checkInterviewCompletion(aiReply) {
    // 🚀 物理条件 1：对话必须超过我们设定的最小轮数（比如 10 轮）
    const MIN_ROUNDS = 10; 
    
    // 🚀 物理条件 2：AI 确实发出了终结信号
    const endKeywords = ["面试结束", "结果将在", "通知", "圆满结束", "🏁"];
    const hasEndKeyword = endKeywords.some(key => aiReply.includes(key));

    if (state.chatCount >= MIN_ROUNDS && hasEndKeyword) {
        console.log("🎯 物理判定：面试已真正结束，正在同步至部长端...");
        archiveInterviewToBoss();
        return true;
    }
    return false;
}

// 封装归档函数
async function archiveInterviewToBoss() {
    const payload = {
        jobId: state.currentJob.id,
        candidateName: state.candidateName || "未知候选人",
        history: state.history,
        finalScore: extractScore(state.history) // 物理加分项：顺便提取 AI 的评价
    };

    const res = await fetch(`${API_BASE}/interview/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if(res.ok) {
        alert("📊 面试报告已物理同步至部长看板。");
        // 物理引导：可以跳回岗位列表或显示总结
    }
}



}