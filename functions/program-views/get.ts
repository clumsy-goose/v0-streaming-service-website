/**
 * EdgeOne Pages Edge Function: 获取所有节目观看量
 * 
 * 此 Edge Function 用于访问 KV 存储，返回所有节目的观看量数据
 * 
 * 部署说明：
 * 1. 在 EdgeOne Pages 控制台创建命名空间（例如：program-stats）
 * 2. 将命名空间绑定到项目，设置变量名为 ProgramVisit
 * 3. 将此文件部署到 functions/program-views/get.ts
 * 
 * 访问路径：/functions/program-views/get
 * 
 * 返回格式：
 * {
 *   ok: true,
 *   data: {
 *     [programId]: {
 *       total: number,
 *       daily: Record<string, number>
 *     }
 *   }
 * }
 */

// 声明全局变量 ProgramVisit（由 EdgeOne Pages 运行时提供）
declare const ProgramVisit: {
  get: (key: string, options?: { type?: string }) => Promise<any>;
  put: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (options?: { prefix?: string; limit?: number; cursor?: string }) => Promise<{
    complete: boolean;
    cursor: string | null;
    keys: Array<{ key: string }>;
  }>;
};

export async function onRequest({ request }: { request: Request }) {
  // ProgramVisit 是绑定命名空间时的变量名，可以直接使用
  
  // 检查 KV 是否可用
  if (!ProgramVisit) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'KV storage not configured. Please bind a namespace to this project.' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // 只支持 GET 方法
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed. Use GET.' }), 
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // 获取所有键值对
    const result: Record<string, { total: number; daily: Record<string, number> }> = {};
    
    // 使用 list 方法遍历所有键
    let cursor: string | null = null;
    let hasMore = true;
    
    while (hasMore) {
      // 构建 list 参数，只在 cursor 有值时才传递
      const listOptions: { limit?: number; cursor?: string } = {
        limit: 256, // 最大限制
      };
      if (cursor) {
        listOptions.cursor = cursor;
      }
      
      const listResult: {
        complete: boolean;
        cursor: string | null;
        keys: Array<{ key: string }>;
      } = await ProgramVisit.list(listOptions);
      
      // 遍历当前页的键
      for (const keyInfo of listResult.keys) {
        const key = keyInfo.key;
        // 获取对应的值
        const value = await ProgramVisit.get(key, { type: 'json' });
        if (value) {
          result[key] = value as { total: number; daily: Record<string, number> };
        }
      }
      
      // 检查是否还有更多数据
      hasMore = !listResult.complete && !!listResult.cursor;
      cursor = listResult.cursor || null;
      
      // 如果已完成，退出循环
      if (listResult.complete) {
        break;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        data: result
      }), 
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Failed to get views' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

