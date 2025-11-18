/**
 * EdgeOne Pages Edge Function: 记录节目观看量
 * 
 * 此 Edge Function 用于访问 KV 存储，记录节目观看量
 * 
 * 部署说明：
 * 1. 在 EdgeOne Pages 控制台创建命名空间（例如：program-stats）
 * 2. 将命名空间绑定到项目，设置变量名为 ProgramVisit
 * 3. 将此文件部署到 functions/program-views/visit.ts
 * 
 * 访问路径：/functions/program-views/visit
 * 
 * KV 存储结构：
 * - Key: 节目 ID (programId)
 * - Value: JSON 对象 { total: number, daily: Record<string, number> }
 *   - total: 总观看量
 *   - daily: 每日观看量，key 为日期 (YYYY-MM-DD)，value 为当日观看次数
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

  // 只支持 POST 方法
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed. Use POST.' }), 
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { programId } = await request.json();
    
    if (!programId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'programId is required' }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Key 就是节目 ID
    const key = programId;
    
    // 获取当前数据
    const existingData = await ProgramVisit.get(key, { type: 'json' });
    
    // 初始化数据结构
    let viewData: { total: number; daily: Record<string, number> } = existingData || {
      total: 0,
      daily: {}
    };
    
    // 确保数据结构正确
    if (typeof viewData.total !== 'number') {
      viewData.total = 0;
    }
    if (!viewData.daily || typeof viewData.daily !== 'object') {
      viewData.daily = {};
    }
    
    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 增加总观看量
    viewData.total += 1;
    
    // 增加今日观看量
    viewData.daily[today] = (viewData.daily[today] || 0) + 1;
    
    // 写回 KV
    await ProgramVisit.put(key, JSON.stringify(viewData));
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        programId,
        views: viewData
      }), 
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Failed to record view' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

