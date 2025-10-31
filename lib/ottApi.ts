import { mdpRequest } from './tencentClient';

// Minimal wrappers for specific Tencent MDP actions
// 1) DescribeStreamPackageLinearAssemblyChannel
export type DescribeChannelParams = {
	ChannelId: string;
};

export async function describeStreamPackageLinearAssemblyChannel(params: DescribeChannelParams) {
	if (!params?.ChannelId) throw new Error('ChannelId is required');
	return mdpRequest('DescribeStreamPackageLinearAssemblyChannel', {
		ChannelId: params.ChannelId,
	});
}

// 2) DescribeStreamPackageLinearAssemblyProgramSchedules
export type DescribeProgramSchedulesParams = {
	ChannelId: string;
	TimeWindow?: number; // seconds
	PageNum?: number;
	PageSize?: number;
};

export async function describeStreamPackageLinearAssemblyProgramSchedules(params: DescribeProgramSchedulesParams) {
	if (!params?.ChannelId) throw new Error('ChannelId is required');
	const payload: Record<string, any> = {
		ChannelId: params.ChannelId,
	};
	if (params.TimeWindow !== undefined) payload.TimeWindow = params.TimeWindow;
	if (params.PageNum !== undefined) payload.PageNum = params.PageNum;
	if (params.PageSize !== undefined) payload.PageSize = params.PageSize;
	return mdpRequest('DescribeStreamPackageLinearAssemblyProgramSchedules', payload);
}

// 3) DescribeStreamPackageLinearAssemblyChannels (list channels)
export type DescribeChannelsParams = {
	PageNum?: number;
	PageSize?: number;
	// Optional filter fields can be added as needed
};

export async function describeStreamPackageLinearAssemblyChannels(params: DescribeChannelsParams = {}) {
	const payload: Record<string, any> = {};
	if (params.PageNum !== undefined) payload.PageNum = params.PageNum;
	if (params.PageSize !== undefined) payload.PageSize = params.PageSize;
	return mdpRequest('DescribeStreamPackageLinearAssemblyChannels', payload);
}


