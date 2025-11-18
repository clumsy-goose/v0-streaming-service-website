# 节目观看量统计功能设计文档

## 概述

基于 EdgeOne Pages KV 存储实现节目观看量统计功能。KV 存储是 EdgeOne Pages 提供的多边缘节点部署的 KV 持久化数据存储，支持全局读写，最终一致性，60秒内保证全球同步访问。

## 数据结构设计

### Key 命名规范

根据 EdgeOne Pages KV 的限制：
- Key 长度 <= 512 B
- 只支持数字、字母和下划线
- 建议使用有意义的命名前缀

#### 设计方案

1. **单个节目总观看量**
   - Key: `program:${programId}:views`
   - Value: 数字字符串（观看次数）
   - 示例: `program:Talk_Show_1_1:views` -> `"1234"`

2. **按日期统计观看量**（可选，用于更详细的统计）
   - Key: `program:${programId}:${date}:views`
   - Value: 数字字符串（当日观看次数）
   - 日期格式: `YYYY-MM-DD`
   - 示例: `program:Talk_Show_1_1:2025-01-15:views` -> `"56"`

3. **节目详细信息**（可选，用于缓存节目元数据）
   - Key: `program:${programId}:info`
   - Value: JSON 字符串
   - 示例: `{"programName": "第 1 期上", "channelId": "xxx", "lastUpdated": 1705276800}`

### Value 存储格式

#### 简单场景（推荐）
直接存储数字字符串，简单高效：
```javascript
// 存储
await ProgramVisit.put('program:Talk_Show_1_1:views', '1234');

// 读取
const views = await ProgramVisit.get('program:Talk_Show_1_1:views');
const viewCount = Number(views) || 0;
```

#### 复杂场景（需要更多信息）
存储 JSON 对象，包含更多统计信息：
```javascript
const viewData = {
  totalViews: 1234,
  lastViewed: Math.floor(Date.now() / 1000),
  dailyViews: {
    '2025-01-15': 56,
    '2025-01-14': 78
  }
};
await ProgramVisit.put('program:Talk_Show_1_1:views', JSON.stringify(viewData), { type: 'json' });
```

## 实现方案

### 1. Edge Function 实现（推荐）

由于 KV 存储只能在 Edge Functions 中使用，需要创建 Edge Function 来处理观看量统计。

#### 文件结构
```
functions/
  program-views/
    index.js  # Edge Function 入口
```

#### Edge Function 代码示例

```javascript
// functions/program-views/index.js
export async function onRequest({ request, env }) {
  const { ProgramVisit } = env; // ProgramVisit 是绑定命名空间时的变量名
  
  if (request.method === 'POST') {
    // 记录观看量
    const { programId } = await request.json();
    
    if (!programId) {
      return new Response(JSON.stringify({ ok: false, error: 'programId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const key = `program:${programId}:views`;
    
    // 获取当前观看量
    let currentViews = await ProgramVisit.get(key);
    currentViews = Number(currentViews) || 0;
    
    // 增加观看量
    currentViews += 1;
    
    // 写回 KV
    await ProgramVisit.put(key, String(currentViews));
    
    // 可选：记录每日观看量
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyKey = `program:${programId}:${today}:views`;
    let dailyViews = await ProgramVisit.get(dailyKey);
    dailyViews = Number(dailyViews) || 0;
    await ProgramVisit.put(dailyKey, String(dailyViews + 1));
    
    return new Response(JSON.stringify({ 
      ok: true, 
      views: currentViews 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'GET') {
    // 查询观看量
    const url = new URL(request.url);
    const programId = url.searchParams.get('programId');
    
    if (!programId) {
      return new Response(JSON.stringify({ ok: false, error: 'programId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
      const key = `program:${programId}:views`;
      const views = await ProgramVisit.get(key);
      const viewCount = Number(views) || 0;
    
    return new Response(JSON.stringify({ 
      ok: true, 
      programId,
      views: viewCount 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 2. Next.js API 路由实现（备选方案）

如果 EdgeOne Pages 支持在 Next.js API 路由中使用 KV，可以创建 API 路由：

```typescript
// app/api/program-views/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 这里需要访问 KV，但需要确认 Next.js 是否支持
  // 如果支持，可以通过环境变量访问
  const { programId } = await request.json()
  
  // 调用 KV 操作...
}

export async function GET(request: Request) {
  // 查询观看量
}
```

## 使用流程

### 1. 记录观看量

在观看页面加载时或视频开始播放时调用：

```typescript
// 在 app/watch/page.tsx 或 components/video-player.tsx 中
useEffect(() => {
  if (currentProgram?.programId) {
    // 记录观看量
    fetch('/functions/program-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId: currentProgram.programId })
    }).catch(err => {
      console.error('Failed to record view:', err)
      // 静默失败，不影响用户体验
    })
  }
}, [currentProgram?.programId])
```

### 2. 查询观看量

在需要显示观看量的地方调用：

```typescript
// 查询单个节目的观看量
const fetchProgramViews = async (programId: string) => {
  const res = await fetch(`/functions/program-views?programId=${programId}`)
  const data = await res.json()
  return data.views || 0
}

// 批量查询多个节目的观看量
const fetchMultipleProgramViews = async (programIds: string[]) => {
  const results = await Promise.all(
    programIds.map(id => 
      fetch(`/functions/program-views?programId=${id}`)
        .then(res => res.json())
        .then(data => ({ programId: id, views: data.views || 0 }))
    )
  )
  return results
}
```

### 3. 显示观看量

在节目列表或详情页显示：

```tsx
// 在组件中显示观看量
const [views, setViews] = useState<number | null>(null)

useEffect(() => {
  if (program.programId) {
    fetchProgramViews(program.programId).then(setViews)
  }
}, [program.programId])

return (
  <div>
    <span>{views !== null ? `${views} 次观看` : '加载中...'}</span>
  </div>
)
```

## 部署步骤

### 1. 启用 KV 存储服务

1. 进入 EdgeOne Pages 控制台
2. 切换到 "KV Storage" 页面
3. 点击 "Apply Now" 按钮申请启用

### 2. 创建命名空间

1. 在 "KV Storage" 页面点击 "Create Namespace"
2. 输入命名空间名称，例如：`program-stats`
3. 点击 "Create" 完成创建

### 3. 绑定命名空间到项目

1. 进入项目详情页
2. 点击 "KV Storage" 菜单
3. 点击 "Bind Namespace" 按钮
4. 选择创建的命名空间
5. 设置变量名，例如：`ProgramVisit`（这个变量名会在 Edge Function 中使用）

### 4. 创建 Edge Function

1. 在项目根目录创建 `functions/program-views/index.js`
2. 编写 Edge Function 代码（参考上面的示例）
3. 部署项目

## 性能优化建议

1. **防抖处理**：避免短时间内重复记录同一用户的观看
   ```javascript
   // 使用 sessionStorage 记录已统计的节目
   const recordedKey = `viewed:${programId}`
   if (!sessionStorage.getItem(recordedKey)) {
     // 记录观看量
     sessionStorage.setItem(recordedKey, '1')
   }
   ```

2. **批量查询**：如果需要显示多个节目的观看量，使用批量查询而不是逐个查询

3. **缓存策略**：在前端缓存观看量数据，减少 API 调用

4. **异步处理**：观看量统计应该异步进行，不影响页面加载速度

## 注意事项

1. **最终一致性**：KV 存储采用最终一致性，60秒内保证全球同步，不适合需要强一致性的场景

2. **存储限制**：
   - 每个账户存储容量：100MB
   - 每个账户可以创建 10 个命名空间
   - 单个 Value 最大 25 MB

3. **Key 命名**：
   - 长度 <= 512 B
   - 只支持数字、字母和下划线
   - 建议使用有意义的命名规范

4. **错误处理**：观看量统计失败不应该影响用户观看体验，应该静默处理错误

## 扩展功能

### 1. 热门节目排行

使用 `list` 方法遍历所有节目的观看量：

```javascript
// 获取所有节目的观看量并排序
const getAllProgramViews = async () => {
  const result = await ProgramVisit.list({ prefix: 'program:', limit: 1000 })
  const programs = []
  
  for (const key of result.keys) {
    if (key.key.endsWith(':views')) {
      const views = Number(await ProgramVisit.get(key.key)) || 0
      const programId = key.key.replace('program:', '').replace(':views', '')
      programs.push({ programId, views })
    }
  }
  
  return programs.sort((a, b) => b.views - a.views)
}
```

### 2. 观看历史记录

为每个用户记录观看历史：

```javascript
// Key: user:${userId}:history:${programId}
// Value: JSON 字符串，包含观看时间等信息
const recordUserHistory = async (userId, programId) => {
  const key = `user:${userId}:history:${programId}`
  const history = {
    programId,
    viewedAt: Math.floor(Date.now() / 1000),
    duration: 0 // 可以记录观看时长
  }
  await ProgramVisit.put(key, JSON.stringify(history))
}
```

