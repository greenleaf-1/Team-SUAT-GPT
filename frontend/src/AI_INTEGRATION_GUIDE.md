# SUAT-GPT AI集成使用指南

## ✅ 集成完成状态

### 已集成的AI模型

1. **Deepseek-R1-671B** - 推理能力强大的模型
   - 接口地址：`http://10.22.18.101:9997/v1`
   - 模型ID：`deepseek-r1-0528-w8a8`
   - 适用场景：复杂问题解答、深度推理

2. **Qwen3-30B-A3B** ⭐ (默认使用)
   - 接口地址：`http://10.22.18.12:40011/v1`
   - 模型ID：`Qwen3-30B-A3B`
   - 适用场景：日常对话、学习辅导、快速响应

3. **Qwen-Embedding**
   - 接口地址：`http://10.22.18.12:40012/v1`
   - 模型ID：`Qwen-embedding`
   - 适用场景：语义搜索、文本相似度计算

### API密钥有效期
- **有效期至：** 2025年12月21日
- **配置位置：** `/utils/ai-service.ts`

---

## 🎯 核心功能

### 1. 智能对话（AI总入口）
- 支持连续对话，保留上下文
- 自动保存聊天历史到Supabase（或本地存储）
- 快速功能按钮（查询课程、考试、DDL、学习计划）
- 实时显示AI思考状态

### 2. 学习辅助功能
AI服务模块提供以下核心函数：

#### `askQuestion(question, context?, conversationHistory?)`
智能问答，适合学生学习场景
```typescript
const answer = await askQuestion("什么是微积分？");
```

#### `analyzeCourseContent(content, type)`
课程内容分析
- `type: 'summary'` - 生成课程摘要
- `type: 'keywords'` - 提取关键知识点
- `type: 'questions'` - 生成复习问题
- `type: 'difficulty'` - 评估难度

#### `gradeHomework(question, studentAnswer, standardAnswer?)`
作业批改辅助
```typescript
const feedback = await gradeHomework(
  "求导：f(x)=x²",
  "f'(x)=2x",
  "f'(x)=2x"
);
```

#### `generateStudyPlan(courses, timeframe, difficulty)`
生成学习计划
```typescript
const plan = await generateStudyPlan(
  ["高等数学", "线性代数"],
  "2周",
  "中等"
);
```

---

## 🔧 技术架构

### 架构设计
```
前端组件 (AIChat.tsx)
    ↓
AI服务层 (ai-service.ts)
    ↓
AI API (内网 10.22.18.x)
```

### 不依赖Supabase Edge Function
为了避免403部署错误，AI功能**直接在前端调用AI API**，不通过Supabase后端。

优点：
- ✅ 避免Edge Function部署问题
- ✅ 减少中间层，响应更快
- ✅ 降低Supabase依赖
- ✅ 更容易调试和维护

### 错误处理
- 网络错误：显示友好提示，说明需要内网环境
- 超时：自动显示错误消息
- API错误：记录详细日志，便于调试

---

## 🚀 使用方法

### 1. 基础对话
1. 打开应用，默认进入"AI总入口"标签页
2. 在输入框输入问题，按Enter或点击发送按钮
3. AI会自动回复（需要在校园网环境下）

### 2. 快速功能
点击顶部的快速功能按钮：
- 查询课程信息
- 查询考试日期
- 查询所有DDL
- 生成学习计划

### 3. 查看AI配置
点击右下角**蓝色齿轮图标**（AI设置按钮）：
- 查看所有AI模型状态
- 检测服务可用性
- 查看API配置信息
- 了解网络要求

### 4. 调试功能
点击右下角**紫色Bug图标**（调试面板）：
- 查看Supabase连接状态
- 运行系统测试
- 导出本地数据
- 重置连接

---

## 🌐 网络要求

### ⚠️ 重要提示
所有AI服务位于**内网环境**（10.22.18.x），必须满足以下条件：

1. ✅ 连接到校园网（Wi-Fi或有线）
2. ✅ 能够访问内网地址
3. ✅ 网络防火墙允许相关端口

### 如果AI服务显示离线
1. 检查网络连接（是否在校园网）
2. 尝试访问 `http://10.22.18.12:40011/v1/models`
3. 联系技术支持确认AI服务状态
4. 查看浏览器控制台的错误信息

---

## 📝 开发者指南

### 添加新的AI功能
在 `/utils/ai-service.ts` 中添加新函数：

```typescript
export async function yourNewFunction(params: any): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '系统提示词'
    },
    {
      role: 'user',
      content: `用户问题：${params}`
    }
  ];

  return await chatCompletion(messages, 'qwen');
}
```

### 切换AI模型
修改 `DEFAULT_MODEL` 常量：
```typescript
// 在 /utils/ai-service.ts 中
const DEFAULT_MODEL = 'deepseek'; // 或 'qwen'
```

### 调整温度和生成参数
在调用时传入 options：
```typescript
const response = await chatCompletion(messages, 'qwen', {
  temperature: 0.9,  // 创造性（0-2）
  max_tokens: 4000,  // 最大生成长度
});
```

---

## 🔒 安全注意事项

### API密钥管理
- ✅ 所有API密钥已硬编码在 `/utils/ai-service.ts`
- ✅ 该文件仅在前端使用，不会泄露到公网
- ⚠️ **不要**将该文件上传到公开的Git仓库
- ⚠️ 密钥有效期至2025年12月21日，到期前需要续期

### 数据隐私
- 对话历史存储在Supabase（或本地localStorage）
- 不会将用户数据发送到第三方
- AI API调用仅发送到内网服务器

---

## 🐛 故障排查

### AI无法响应
**现象：** 点击发送后，显示"AI服务暂时无法使用"

**解决方案：**
1. 打开AI设置面板，检查服务状态
2. 确认在校园网环境
3. 查看浏览器控制台错误信息
4. 尝试访问API地址（如 `http://10.22.18.12:40011/v1/models`）

### Supabase连接问题
**现象：** 显示"⚠️ 无法连接到Supabase"

**解决方案：**
1. 这**不影响AI功能**（AI直接调用，不依赖Supabase）
2. 会自动降级到本地存储
3. 对话历史会保存在浏览器localStorage中
4. 如需恢复Supabase：打开调试面板 → 重置连接并刷新

### Edge Function 403错误
**现象：** 部署时出现403 Forbidden错误

**解决方案：**
- ✅ AI功能**不受影响**（不使用Edge Function）
- ✅ 应用会自动使用本地存储模式
- 如需使用Supabase其他功能，联系管理员检查项目权限

---

## 📊 使用统计（建议添加）

未来可以添加的功能：
- [ ] AI对话次数统计
- [ ] 常用问题分析
- [ ] 学习效果评估
- [ ] 多模型对比测试
- [ ] 用户反馈收集

---

## 📞 技术支持

如有问题，请查看：
1. `/SUPABASE_TROUBLESHOOTING.md` - Supabase故障排查
2. `/README_SUPABASE_FIX.md` - Supabase修复说明
3. 浏览器控制台错误日志
4. AI设置面板的服务状态

---

## ✅ 总结

### 已完成
- ✅ 集成3个AI模型（Deepseek、Qwen、Embedding）
- ✅ 实现智能对话功能（带上下文）
- ✅ 创建AI服务模块（完整API封装）
- ✅ 添加AI设置面板（服务状态监控）
- ✅ 完善错误处理（友好提示）
- ✅ 独立于Supabase Edge Function（避免403错误）

### 使用要点
1. 必须在**校园网环境**下使用
2. 默认使用**Qwen3-30B**模型
3. 对话历史自动保存
4. 支持连续对话（保留上下文）
5. API有效期至**2025年12月21日**

### 下一步建议
1. 在校园网环境下测试AI功能
2. 根据实际使用情况调整模型参数
3. 收集用户反馈，优化提示词
4. 到期前联系管理员续期API密钥
