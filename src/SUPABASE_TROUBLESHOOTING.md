# Supabase 故障排查指南

## 🔍 快速诊断

您的应用已经配置了**自动降级系统**，当Supabase不可用时会自动切换到本地存储模式。

### 当前连接信息
- **Project ID**: `znqcpvokmhkdwdtcajhe`
- **API URL**: `https://znqcpvokmhkdwdtcajhe.supabase.co`
- **Edge Function**: `/functions/v1/make-server-4896d9cd`

---

## ✅ 自动降级系统

应用已经实现了完整的**自动降级机制**：

1. **首次加载时**：自动检查Supabase连接状态
2. **连接失败时**：自动切换到本地存储（localStorage）
3. **用户提示**：会在页面顶部显示黄色提示框，告知用户当前处于离线模式
4. **功能保持**：所有功能正常工作，数据保存在浏览器本地

### 降级触发条件
- Supabase API 请求超时（5秒）
- 网络连接失败
- 服务器返回错误
- Edge Function 不可用

---

## 🛠️ 常见问题及解决方案

### 1. Edge Function 未部署

**症状**：
- 控制台显示 404 错误
- 无法初始化数据
- API 请求全部失败

**解决方案**：
```bash
# 确保已安装 Supabase CLI
npm install -g supabase

# 登录到 Supabase
supabase login

# 部署 Edge Function
supabase functions deploy make-server-4896d9cd --project-ref znqcpvokmhkdwdtcajhe
```

**临时方案**：
应用会自动使用本地存储，无需额外配置。

---

### 2. CORS 错误

**症状**：
- 控制台显示 CORS policy 错误
- 请求被浏览器拦截

**解决方案**：
服务器端已配置 CORS，如果仍有问题：
1. 检查 Supabase 项目设置中的 CORS 配置
2. 确认您的域名已添加到允许列表
3. 临时方案：应用会自动降级到本地存储

---

### 3. 数据库表不存在

**症状**：
- 错误提示：`relation "kv_store_4896d9cd" does not exist`

**解决方案**：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard/project/znqcpvokmhkdwdtcajhe/database/tables)
2. 在 SQL Editor 中运行以下命令：

```sql
CREATE TABLE IF NOT EXISTS kv_store_4896d9cd (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

**临时方案**：
应用会自动使用本地存储，数据完全可用。

---

### 4. API Key 过期或无效

**症状**：
- 401 Unauthorized 错误
- Authentication failed

**解决方案**：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard/project/znqcpvokmhkdwdtcajhe/settings/api)
2. 复制新的 `anon` key
3. 更新 `/utils/supabase/info.tsx` 中的 `publicAnonKey`

**临时方案**：
应用会自动使用本地存储。

---

### 5. 网络超时

**症状**：
- 请求长时间无响应
- 控制台显示 timeout 错误

**解决方案**：
- 检查网络连接
- 确认 Supabase 服务状态：https://status.supabase.com/
- 应用会自动在 5 秒后切换到本地模式

---

## 📊 连接状态监控

### 查看当前连接状态

打开浏览器控制台（F12），查看以下信息：

- ✅ **Supabase连接正常** - 使用远程数据库
- ⚠️ **无法连接到Supabase，已切换到本地存储模式** - 使用本地存储

### 手动测试连接

在浏览器控制台运行：
```javascript
// 测试健康检查端点
fetch('https://znqcpvokmhkdwdtcajhe.supabase.co/functions/v1/make-server-4896d9cd/health', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## 🔄 强制使用本地存储

如果您想始终使用本地存储（不连接 Supabase）：

在 `/utils/api.ts` 中修改：
```typescript
// 设置为 true 强制使用本地存储
let useLocalStorage = true;  // 改为 true
let connectionChecked = true;  // 改为 true
```

---

## 💾 本地数据管理

### 查看本地数据
在浏览器控制台运行：
```javascript
// 查看所有本地数据
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('suat-local-')) {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  }
}
```

### 清除本地数据
```javascript
// 清除所有 SUAT 相关数据
Object.keys(localStorage)
  .filter(key => key.startsWith('suat-'))
  .forEach(key => localStorage.removeItem(key));

// 刷新页面
location.reload();
```

### 导出本地数据
```javascript
const data = {};
Object.keys(localStorage)
  .filter(key => key.startsWith('suat-local-'))
  .forEach(key => {
    data[key] = JSON.parse(localStorage.getItem(key));
  });
console.log(JSON.stringify(data, null, 2));
```

---

## 🚀 恢复 Supabase 连接

当 Supabase 问题解决后：

1. **清除本地标记**：
```javascript
localStorage.removeItem('suat-data-initialized');
```

2. **刷新页面**：应用会重新检查连接并尝试使用 Supabase

3. **数据迁移**（可选）：
   - 本地数据可以手动导出
   - 重新连接后，Supabase 会初始化默认数据
   - 如需保留本地数据，需要手动迁移

---

## 📝 检查清单

遇到问题时，按以下顺序检查：

- [ ] 检查网络连接
- [ ] 查看浏览器控制台错误
- [ ] 确认 Supabase 项目状态
- [ ] 检查 Edge Function 是否部署
- [ ] 验证数据库表是否存在
- [ ] 确认 API Key 有效
- [ ] 查看连接状态提示
- [ ] 如果都失败，应用会自动使用本地存储 ✅

---

## 🆘 获取帮助

如果问题持续存在：

1. **查看日志**：
   - 浏览器控制台（F12）
   - Supabase Dashboard > Logs

2. **检查服务状态**：
   - https://status.supabase.com/

3. **联系支持**：
   - Supabase Discord: https://discord.supabase.com/
   - GitHub Issues: https://github.com/supabase/supabase

---

## 💡 建议

1. **开发环境**：建议使用本地存储模式，避免频繁的 API 调用
2. **生产环境**：确保 Supabase 正常运行，提供更好的多端同步体验
3. **数据备份**：定期导出重要数据
4. **监控连接**：页面顶部会显示连接状态

---

**记住**：即使 Supabase 完全不可用，您的应用仍然可以正常工作！所有数据都会安全地保存在本地浏览器中。
