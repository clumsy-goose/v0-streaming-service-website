import { NextResponse } from 'next/server'
import { describeStreamPackageLinearAssemblyPrograms } from '@/lib/ottApi'

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const ChannelId = searchParams.get('channelId') || ''
		const PageNum = searchParams.get('pageNum')
		const PageSize = searchParams.get('pageSize')

		if (!ChannelId) {
			return NextResponse.json({ ok: false, error: 'channelId is required' }, { status: 400 })
		}

		const data = await describeStreamPackageLinearAssemblyPrograms({
			ChannelId,
			PageNum: PageNum ? Number(PageNum) : undefined,
			PageSize: PageSize ? Number(PageSize) : undefined,
		})
		return NextResponse.json({ ok: true, data })
	} catch (err: any) {
		return NextResponse.json({ ok: false, error: err?.message || 'Request failed' }, { status: 500 })
	}
}

