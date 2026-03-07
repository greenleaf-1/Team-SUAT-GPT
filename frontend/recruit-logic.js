// 1. 加载招聘看板
async function loadJobStats() {
    const res = await fetch(`${API_BASE}/admin/job-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const stats = await res.json();
    
    const container = document.getElementById('stat-container');
    container.innerHTML = stats.map(job => `
        <div class="bg-white p-6 rounded-2xl border mb-4 hover:shadow-md transition-all">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-purple-700">${job.title}</h3>
                <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">${job.status}</span>
            </div>
            <p class="text-gray-500 text-sm line-clamp-2 mb-4">${job.adText}</p>
            <div class="flex justify-between items-center border-t pt-4">
                <span class="text-gray-600 font-medium">👥 已报名: ${job.candidateCount} 人</span>
                <button onclick='showCandidates(${JSON.stringify(job.candidates)}, "${job.title}")' 
                        class="text-purple-600 font-bold hover:underline">
                    查看候选人名单 →
                </button>
            </div>
        </div>
    `).join('');
}

// 2. 展示候选人详情（包含笔试和报告）
function showCandidates(candidates, jobTitle) {
    const modal = document.getElementById('candidate-modal');
    const list = document.getElementById('candidate-list');
    
    document.getElementById('modal-title').innerText = `${jobTitle} - 候选人筛选`;
    
    list.innerHTML = candidates.map(c => `
        <div class="border-b py-4 last:border-0">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-lg">${c.candidateName}</h4>
                    <p class="text-sm text-gray-400">📄 简历: ${c.fileName}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-black text-purple-600">${extractScore(c.evaluationReport)}分</div>
                    <p class="text-xs text-gray-400">AI 综合评估</p>
                </div>
            </div>
            <div class="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                <strong>💡 AI 核心评价：</strong>
                <p class="mt-1">${c.evaluationReport || '笔试进行中...'}</p>
            </div>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
}

// 物理技巧：从 AI 评估文本中提取分数
function extractScore(report) {
    if(!report) return 0;
    const match = report.match(/(\d+)分/);
    return match ? match[1] : '待定';
}