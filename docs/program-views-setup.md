# 节目观看量统计功能部署指南

## 功能概述

基于 EdgeOne Pages KV 存储实现的节目观看量统计功能，支持：
- 自动记录节目观看量
- 查询单个节目的观看量
- 显示观看量统计
- 按日期统计观看量（可选）

## 部署步骤

### 1. 启用 KV 存储服务

1. 登录 EdgeOne Pages 控制台
2. 切换到 **"KV Storage"** 页面
3. 点击 **"Apply Now"** 按钮申请启用
4. 等待审核通过（通常很快）

### 2. 创建命名空间

1. 在 **"KV Storage"** 页面，点击 **"Create Namespace"** 按钮
2. 输入命名空间名称，例如：`program-stats`
3. 点击 **"Create"** 完成创建

### 3. 绑定命名空间到项目

有两种方式可以绑定：

#### 方式一：在 KV Storage 页面绑定

1. 在命名空间列表中，点击对应的命名空间名称
2. 进入命名空间详情页，点击 **"Bind Project"** 标签
3. 点击 **"Bind Project"** 按钮
4. 选择要绑定的项目
5. 设置变量名，例如：`ProgramVisit`（这个变量名会在 Edge Function 中使用）

#### 方式二：在项目页面绑定

1. 进入项目详情页
2. 点击左侧菜单 **"KV Storage"**
3. 点击 **"Bind Namespace"** 按钮
4. 选择创建的命名空间（例如：`program-stats`）
5. 设置变量名，例如：`ProgramVisit`

**重要**：变量名 `ProgramVisit` 需要与 Edge Function 代码中的变量名一致。

### 4. 部署 Edge Function

1. 确保项目根目录存在 `functions/program-views/index.js` 文件
2. 如果使用 Git 部署，提交并推送代码
3. 如果使用直接上传，上传包含 Edge Function 的项目文件
4. 等待部署完成

### 5. 验证部署

1. 访问观看页面（例如：`/watch?channel=xxx&date=2025-01-15&time=12:00&title=xxx`）
2. 打开浏览器开发者工具，查看 Network 标签
3. 应该能看到对 `/api/program-views` 的请求
4. 检查控制台是否有错误信息

## 数据结构

### Key 命名规范

- **总观看量**：`program:${programId}:views`
  - 示例：`program:Talk_Show_1_1:views`
  - 值：数字字符串，如 `"1234"`

- **每日观看量**：`program:${programId}:${date}:views`
  - 示例：`program:Talk_Show_1_1:2025-01-15:views`
  - 值：数字字符串，如 `"56"`
  - 日期格式：`YYYY-MM-DD`

### 数据示例

```
Key: program:Talk_Show_1_1:views
Value: "1234"

Key: program:Talk_Show_1_1:2025-01-15:views
Value: "56"
```

## API 使用

### 记录观看量

```typescript
// POST /api/program-views
const response = await fetch('/api/program-views', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ programId: 'Talk_Show_1_1' })
})

const data = await response.json()
// { ok: true, programId: 'Talk_Show_1_1', views: 1235, dailyViews: 57 }
```

### 查询观看量

```typescript
// GET /api/program-views?programId=Talk_Show_1_1
const response = await fetch('/api/program-views?programId=Talk_Show_1_1')
const data = await response.json()
// { ok: true, programId: 'Talk_Show_1_1', views: 1234, dailyViews: 56 }
```

## 功能特性

### 1. 自动防抖

使用 `sessionStorage` 避免同一会话中重复记录同一节目的观看量：
- 首次访问：记录观看量并增加计数
- 同一会话再次访问：只查询观看量，不重复计数

### 2. 静默失败

观看量统计失败不会影响用户观看体验：
- 所有错误都在控制台记录
- 不会显示错误提示给用户
- 页面正常加载和播放

### 3. 实时显示

观看量会在观看页面实时显示：
- 位置：节目标题下方，频道名称旁边
- 格式：`{views} 次观看`
- 更新：记录观看后立即更新显示

## 扩展功能

### 查询热门节目

可以通过 Edge Function 扩展功能，查询观看量最高的节目：

```javascript
// 在 Edge Function 中添加
export async function onRequest({ request, env }) {
  const { ProgramVisit } = env;
  
  if (request.method === 'GET' && url.pathname === '/popular') {
    const result = await ProgramVisit.list({ prefix: 'program:', limit: 1000 });
    const programs = [];
    
    for (const key of result.keys) {
      if (key.key.endsWith(':views') && !key.key.includes(':')) {
        const views = Number(await ProgramVisit.get(key.key)) || 0;
        const programId = key.key.replace('program:', '').replace(':views', '');
        programs.push({ programId, views });
      }
    }
    
    programs.sort((a, b) => b.views - a.views);
    
    return new Response(JSON.stringify({ ok: true, programs: programs.slice(0, 10) }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

## 注意事项

1. **KV 存储限制**：
   - 每个账户存储容量：100MB
   - 每个账户可以创建 10 个命名空间
   - 单个 Value 最大 25 MB
   - Key 长度 <= 512 B

2. **最终一致性**：
   - KV 存储采用最终一致性
   - 60秒内保证全球同步访问
   - 不适合需要强一致性的场景

3. **变量名一致性**：
   - Edge Function 中的变量名必须与绑定命名空间时设置的变量名一致
   - 默认使用 `ProgramVisit`，如需修改，需要同时修改 Edge Function 代码

4. **错误处理**：
   - 所有 KV 操作都应该有错误处理
   - 失败时不应该影响主要功能

## 故障排查

### 问题：观看量没有记录

1. 检查 KV 存储是否已启用
2. 检查命名空间是否已创建并绑定到项目
3. 检查变量名是否与 Edge Function 代码一致
4. 检查 Edge Function 是否已部署
5. 查看浏览器控制台和 EdgeOne Pages 日志

### 问题：显示 "Edge Function required"

这表示当前环境无法直接访问 KV 存储，需要：
1. 确保已部署 Edge Function
2. 确保 Edge Function 路径正确：`/functions/program-views`
3. 检查 Edge Function 代码中的变量名是否正确

### 问题：观看量不更新

1. 检查 sessionStorage 是否阻止了重复记录（这是正常行为）
2. 清除浏览器 sessionStorage 后重新测试
3. 检查 KV 存储是否有写入权限

## 相关文档

- [EdgeOne Pages KV 存储文档](https://pages.edgeone.ai/document/kv-storage)
- [EdgeOne Pages KV 集成指南](https://pages.edgeone.ai/document/pages-kv-integration)
- [设计文档](./program-views-kv-design.md)

