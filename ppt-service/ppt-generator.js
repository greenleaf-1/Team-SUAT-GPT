const { marpCli } = require('@marp-team/marp-cli');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json({ limit: '50mb' }));

app.post('/api/export-pptx', async (req, res) => {
    const { markdown, fileName } = req.body; 
    
    // ✅ 修正 1：使用 path.join 处理 Linux 兼容路径，不再使用 D:\ [cite: 2026-02-20]
    const safeName = (fileName || 'extraction').replace(/[\\/:*?"<>|]/g, '_');
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir); // 确保临时目录存在

    const tempMd = path.join(tempDir, `temp_${Date.now()}.md`);
    const tempPptx = tempMd.replace('.md', '.pptx');

    try {
        if (!markdown) throw new Error('Markdown 内容为空');
        fs.writeFileSync(tempMd, markdown);

        console.log(`>>> 生产环境指令：正在为 David 生成 PPT: ${safeName}`);
        
        // ✅ 修正 2：在 Linux 服务器上，LibreOffice 路径通常在 /usr/bin/soffice
        // 如果你的服务器安装了 LibreOffice，Marp 会自动尝试调用。
        // 如果报错依旧，请先执行 sudo apt install libreoffice
        await marpCli([tempMd, '-o', tempPptx, '--pptx', '--pptx-editable']);

        if (!fs.existsSync(tempPptx)) throw new Error('PPT 生成失败，请确认服务器已安装 LibreOffice');

        res.download(tempPptx, `${safeName}.pptx`, () => {
            // 传输完成后物理清理
            try {
                if (fs.existsSync(tempMd)) fs.unlinkSync(tempMd);
                if (fs.existsSync(tempPptx)) fs.unlinkSync(tempPptx);
            } catch (e) { console.error("清理失败", e); }
        });
    } catch (err) {
        console.error('❌ 生产环境转码失败:', err.message);
        // ✅ 修正 3：如果可编辑模式崩溃，自动尝试“标准模式”作为兜底，防止 David 下载不到文件
        try {
            console.log(">>> 正在尝试标准模式（非编辑）兜底生成...");
            await marpCli([tempMd, '-o', tempPptx, '--pptx']);
            res.download(tempPptx, `${safeName}.pptx`);
        } catch (innerErr) {
            res.status(500).json({ error: '转码服务崩溃，请检查服务器 LibreOffice 环境' });
        }
    }
});

app.listen(3002, '0.0.0.0', () => console.log('🚀 SUAT PPT Engine Started on Port 3002'));