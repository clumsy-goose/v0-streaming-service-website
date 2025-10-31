import { NextResponse } from 'next/server'
import { describeStreamPackageLinearAssemblyChannels } from '@/lib/ottApi'

export async function GET() {
	try {
		const data = await describeStreamPackageLinearAssemblyChannels({ PageNum: 1, PageSize: 50 })
		return NextResponse.json({ ok: true, data })
	} catch (err: any) {
		return NextResponse.json({ ok: false, error: err?.message || 'Request failed' }, { status: 500 })
	}
}


