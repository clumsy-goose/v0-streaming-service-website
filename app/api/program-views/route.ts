import { NextResponse } from 'next/server'

/**
 * 节目观看量统计 API
 * 
 * 注意：此 API 需要在 EdgeOne Pages 环境中使用 Edge Function 来访问 KV 存储
 * 如果当前环境不支持直接访问 KV，需要部署 Edge Function 来处理
 * 
 * Edge Function 路径：/functions/program-views
 */

// POST: 记录观看量
export async function POST(request: Request) {
  try {
    const { programId } = await request.json()

    if (!programId) {
      return NextResponse.json(
        { ok: false, error: 'programId is required' },
        { status: 400 }
      )
    }

    // 在 EdgeOne Pages 环境中，这里应该调用 Edge Function
    // 或者如果支持，直接访问 env.my_kv
    // 当前作为占位实现，实际需要部署 Edge Function
    
    // 调用 Edge Function 记录观看量
    // const response = await fetch(`${process.env.EDGEONE_FUNCTION_URL}/program-views`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ programId })
    // })
    // const data = await response.json()
    
    // 临时实现：返回成功，实际需要部署 Edge Function
    return NextResponse.json({
      ok: true,
      message: 'View recorded (Edge Function required for KV access)',
      programId
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Request failed' },
      { status: 500 }
    )
  }
}

// GET: 查询观看量
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json(
        { ok: false, error: 'programId is required' },
        { status: 400 }
      )
    }

    // 在 EdgeOne Pages 环境中，这里应该调用 Edge Function
    // 或者如果支持，直接访问 env.my_kv
    
    // 调用 Edge Function 查询观看量
    // const response = await fetch(`${process.env.EDGEONE_FUNCTION_URL}/program-views?programId=${programId}`)
    // const data = await response.json()
    
    // 临时实现：返回 0，实际需要部署 Edge Function
    return NextResponse.json({
      ok: true,
      programId,
      views: 0,
      message: 'Edge Function required for KV access'
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Request failed' },
      { status: 500 }
    )
  }
}

