# 🚀 快速参考

## 📌 关键信息

### Supabase 项目信息
```
Project ID: znqcpvokmhkdwdtcajhe
API URL: https://znqcpvokmhkdwdtcajhe.supabase.co
Edge Function: make-server-4896d9cd
Dashboard: https://supabase.com/dashboard/project/znqcpvokmhkdwdtcajhe
```

---

## 🎯 应用状态

### ✅ 在线模式（Supabase 可用）
- 数据保存在云端
- 支持多端同步
- 控制台显示：`✅ Supabase连接正常`

### ⚠️ 离线模式（Supabase 不可用）
- 数据保存在本地浏览器
- 所有功能正常使用
- 控制台显示：`⚠️ 无法连接到Supabase，已切换到本地存储模式`
- 页面顶部显示黄色提示框

---

## 🛠️ 快速操作

### 打开调试面板
点击右下角的 **🐛 图标**

### 查看连接状态
打开调试面板 → 查看"连接状态"部分

### 导出本地数据
调试面板 → 本地数据 → 导出数据

### 清除所有数据
调试面板 → 本地数据 → 清除数据

### 重置连接
调试面板 → 快速操作 → 重置连接并刷新

### 强制刷新
```javascript
// 在控制台运行
localStorage.clear();
location.reload();
```

---

## 🔍 故障诊断

### 步骤 1: 打开调试面板
点击右下角 🐛

### 步骤 2: 运行系统测试
点击"运行测试"按钮

### 步骤 3: 检查测试结果
- ✓ localStorage 可用
- ✓ 网络连接
- ⚠ Supabase 连接
- ✓ 数据初始化

### 步骤 4: 根据结果采取行动
- 所有 ✓ = 正常，可能是暂时性问题
- Supabase ⚠ = 离线模式，查看详细故障排查指南

---

## 📂 文件结构

### 核心文件
```
/App.tsx                           # 主应用
/utils/api.ts                      # API 调用（带自动降级）
/utils/storage-fallback.ts         # 本地存储方案
/components/DataInitializer.tsx    # 数据初始化
/components/ConnectionStatus.tsx   # 连接状态提示
/components/DebugPanel.tsx         # 调试面板
```

### 文档文件
```
/README_SUPABASE_FIX.md            # 完整说明文档
/SUPABASE_TROUBLESHOOTING.md       # 详细故障排查指南
/QUICK_REFERENCE.md                # 本文件 - 快速参考
```

---

## 💾 控制台命令

### 查看本地数据
```javascript
// 查看所有 SUAT 数据
Object.keys(localStorage)
  .filter(k => k.startsWith('suat-'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
```

### 导出数据到控制台
```javascript
const data = {};
Object.keys(localStorage)
  .filter(k => k.startsWith('suat-local-'))
  .forEach(k => data[k] = JSON.parse(localStorage.getItem(k)));
console.log(JSON.stringify(data, null, 2));
```

### 清除本地数据
```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('suat-'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

### 重置应用
```javascript
localStorage.removeItem('suat-data-initialized');
location.reload();
```

### 测试 Supabase 连接
```javascript
fetch('https://znqcpvokmhkdwdtcajhe.supabase.co/functions/v1/make-server-4896d9cd/health')
  .then(r => r.json())
  .then(d => console.log('✅ Supabase 在线:', d))
  .catch(e => console.log('❌ Supabase 离线:', e));
```

---

## 🎨 UI 元素

### 调试按钮
- **位置**: 右下角
- **图标**: 🐛
- **功能**: 打开调试面板

### 连接状态提示
- **位置**: 页面顶部
- **颜色**: 黄色背景
- **显示时机**: 离线模式
- **消失时间**: 5秒

### 初始化加载
- **全屏覆盖**: 白色背景
- **图标**: 旋转的加载器 / ✓ 完成标志
- **消息**: 实时显示初始化进度

---

## 📊 数据存储键名

```
suat-data-initialized           # 初始化标记
suat-local-courses              # 课程列表
suat-local-notifications        # 通知列表
suat-local-profile              # 用户资料
suat-local-chat                 # 聊天历史
suat-local-homework             # 作业数据
suat-local-progress-{courseId}  # 课程进度
suat-local-bookmarks-{courseId} # 课程书签
suat-local-notes-{courseId}     # 课程笔记
suat-local-submission-{hwId}    # 作业提交
```

---

## ⚡ 性能优化

### 连接检查
- 首次检查超时: 5秒
- API 请求超时: 10秒
- 自动重试: 否（直接降级）
- 后台检查: 每30秒（仅在调试面板开启时）

### 本地存储
- 自动保存: 是
- 数据压缩: 否
- 最大容量: 浏览器限制（通常 5-10MB）

---

## 🔐 安全提示

### 本地存储
- 数据未加密
- 可被同域脚本访问
- 清除浏览器数据会丢失
- 不适合存储敏感信息

### 推荐做法
- 定期导出重要数据
- 不要在生产环境长期使用离线模式
- 尽快修复 Supabase 连接问题

---

## 📞 需要更多帮助？

### 🔍 详细故障排查
查看 `SUPABASE_TROUBLESHOOTING.md`

### 📖 完整说明
查看 `README_SUPABASE_FIX.md`

### 🐛 使用调试面板
点击右下角的 🐛 图标

### 💬 控制台日志
按 F12 打开开发者工具查看详细日志

---

**提示**: 将此文件收藏起来，以便快速查找命令和操作！
