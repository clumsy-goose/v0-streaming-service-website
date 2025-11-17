interface ProgramBasicInfo {
	programName: string;
	programDescription: string;
}

export interface Program extends ProgramBasicInfo {
	programId: string;
	startTime: number;
	duration: number;
	endTime: number;
	status: "not-started" | "live" | "ended";
	viewers: number;
}

interface ChannelBasicInfo {
	channelName: string;
	channelDescription: string;
	image: string;
}

export interface Channel extends ChannelBasicInfo {
	channelId: string;
	playbackURL: string;
	playingProgram: Program;
	nextProgram: Program;
	// playbackConf: {
	// 	startTime: number;
	// 	duration: number;
	// };
	schedules: Program[];
}


export const channelsMap: Record<string, ChannelBasicInfo> = {
	nba: {
		channelName: "NBA 直播频道",
		channelDescription:
			"NBA，也称美国职业篮球联赛，是全世界水平最高的篮球联赛，本频道提供2023-2024赛季NBA总决赛回放。凯尔特人击败独行侠，总比分4-1加冕2023-2024赛季NBA总冠军，队史第18次捧起总冠军奖杯！",
		image: "/nba.webp",
	},
	snooker: {
		channelName: "斯诺克直播频道",
		channelDescription:
			"2025年世界斯诺克锦标赛正赛于4月19日-5月5日在英国谢菲尔德进行。本届世锦赛正赛迎来10位中国球员参赛，大幅刷新此前6人参赛的历史纪录。在最终的冠军对决中，中国选手赵心童战胜马克·威廉姆斯获得冠军，这也是中国选手首次获得斯诺克世锦赛冠军头衔。",
		image: "/snooker.jpg",
	},
	talk_show: {
		channelName: "脱口秀直播频道",
		channelDescription:
			"脱口秀，是一种以幽默、调侃为主要表现形式的语言艺术形式。本频道提供《脱口秀和他的朋友们第二季》的节目回放。",
		image: "/talkshow.webp",
	},
	drama: {
		channelName: "电视剧直播频道",
		channelDescription:
			"本频道是电视剧频道，提供电视剧的节目回放，本频道提供《请回答1988》的节目回放。《请回答1988》以1988年汉城（今首尔）奥运会为故事背景，讲述住在首尔市道峰区双门洞的五个家庭的故事",
		image: "/drama.jpeg",
	},
	movie: {
		channelName: "电影直播频道",
		channelDescription:
			"本频道是电影频道，每天不间断地播放豆瓣Top 250的电影，豆瓣根据每部影片看过的人数以及该影片所得的评价等综合数据，通过算法分析产生豆瓣电影 Top 250",
		image: "/movie.jpg",
	},
	'ad_test2': {
		channelName: "广告演示频道",
		channelDescription:
			"本频道是广告频道，用于演示Streampackage的广告插入功能，在腾讯云音视频产品 Stream Service 上，可以实现基于 SCTE-35 和 SSAI 的动态广告插入。",
		image: "/advertise.webp",
	},
}

export const programsMap: Record<string, ProgramBasicInfo> = {
	// 脱口秀
	'Talk_Show_1_1': {
		programName: "第 1 期上:王勉欢乐开场,李宇春脱口秀首秀",
		programDescription:
			"王勉以音乐脱口秀《自来嗨》拉开序幕，何广智带来踢球崴脚的故事，开场即炸场，李宇春作为新朋友带来脱口秀首秀。",
	},
	'Talk_Show_1_2': {
		programName: "第 1 期下:全场嗨翻 Kid 江梓浩进击",
		programDescription:
			"众多脱口秀演员精彩表演，Kid、江梓浩等选手展现出强大的实力，现场氛围热烈。",
	},
	'Talk_Show_2_1': {
		programName: "第 2 期上:邱瑞谈冒犯的边界",
		programDescription:
			"邱瑞大胆探讨冒犯的边界，其独特的表演风格和幽默的语言引发观众笑声。",
	},
	'Talk_Show_2_2': {
		programName: "第 2 期下:女演员接连炸场 燃起来",
		programDescription:
			"小蝶、小帕等女演员讲述原生家庭带来的创伤与成长，引发全场共鸣，展现出女性脱口秀演员的魅力。",
	},
	'Talk_Show_3_1': {
		programName: "第 3 期上:贾耗全妆上台，“女警察叔叔”经验全场",
		programDescription:
			"贾耗全妆上台表演，还有选手带来与云南警察相关的有趣故事等。",
	},
	'Talk_Show_3_2': {
		programName: "第 3 期下:徐志胜和拆二代相爱相杀",
		programDescription:
			"徐志胜带来精彩的脱口秀表演，其他选手也围绕相关主题展开讲述，内容丰富多样。",
	},
	'Talk_Show_4_1': {
		programName: "第 4 期上:毛豆呼兰 PK 不要太精彩",
		programDescription:
			"毛豆和呼兰展开精彩 PK，各自讲述独特的故事，展现出高水平的脱口秀技艺。",
	},
	'Talk_Show_4_2': {
		programName: "第 4 期下:李宇春为所有女生献唱新歌",
		programDescription:
			"李宇春为女生献唱新歌，此外还有其他选手带来精彩表演。",
	},	
	'Talk_Show_5_1': {
		programName: "第 5 期上:呼兰大国手开启矛与盾之争",
		programDescription:
			"呼兰、大国手等选手展开精彩对决，探讨相关话题，引发观众思考。",
	},
	'Talk_Show_5_2': {
		programName: "第 5 期中:邱瑞 PK 高寒",
		programDescription:
			"邱瑞和高寒进行激烈 PK，两人的表演都十分精彩，赢得观众阵阵掌声。",
	},
	'Talk_Show_5_3': {
		programName: "第 5 期下:魔性中专师傅他又来了",
		programDescription:
			"有选手再次带来关于魔性中专师傅的有趣故事，还有其他精彩内容呈现。",
	},
	// 电视剧
	'1988_E01': {
		programName: "请回答1988 第一集",
		programDescription:
			"在虽然物质不充足，但是邻里分享是很理所当然的1988年，双门洞到处是家庭主妇们的聊天声，还有在胡同吵闹的孩子们。一年365日，有着人情味的双门洞故事开始了",
	},
	'1988_E02': {
		programName: "请回答1988 第二集",
		programDescription:
			"在双门洞东镒的家里，必须要遵守的一项，不要招惹疯婆子宝拉。不顾一花的劝阻，还是动了宝拉“最爱惜的东西”的德善，俩人之间流漏出不寻常的气息。另一方面，善宇、正焕、东龙幻想着18年的人生中最刺激的脱轨。德善奶奶过世，德善一家人回到老家吊唁。",
	},
	'1988_E03': {
		programName: "请回答1988 第三集",
		programDescription:
			"因修学旅行而兴奋的孩子们，德善为了准备特长而忙着。以愉快的心情出发的修学旅行，激动的心情变得沮丧。对有钱也不会花的老公不满的美兰，给了成钧一个任务。另一方面，德善在不知不觉中，对初恋的感情更加深了。文艺汇演当晚，东龙、善宇和正焕如约而至。三人精彩的表演瞬间掳获了在场万千少女心，德善也如愿拿到了奖品。",
	},  
	// 斯诺克
	'2025_Snooker_WC_FirstRound_1': {
		programName: "2025世界斯诺克锦标赛第一轮(第一阶段)",
		programDescription:
			"2025年世界斯诺克锦标赛第一轮(第一阶段)，中国选手赵心童对阵杰克琼斯，第一阶段结束，赵心童7-7杰克琼斯，取得大比分领先。",
	},
	'2025_Snooker_WC_FirstRound_2': {
		programName: "2025世界斯诺克锦标赛第一轮(第二阶段)",
		programDescription:
			"2025年世界斯诺克锦标赛第一轮(第二阶段)，中国选手赵心童对阵杰克琼斯，第二阶段结束，赵心童10-4战胜杰克琼斯，晋级第二轮。",
	},
	'2025_Snooker_WC_Final_1': {
		programName: "2025世界斯诺克锦标赛决赛(第一阶段)",
		programDescription:
			"2025年世界斯诺克锦标赛决赛(第一阶段)，中国选手赵心童对阵马克·威廉姆斯，第一阶段结束，赵心童7-1马克·威廉姆斯，取得巨大领先。",
	},	
	'2025_Snooker_WC_Final_2': {
		programName: "2025世界斯诺克锦标赛决赛(第二阶段)",
		programDescription:
			"2025年世界斯诺克锦标赛决赛(第二阶段)，中国选手赵心童对阵马克·威廉姆斯，第二阶段结束，马克·威廉姆斯追回5局，将大比分追至11-6。",
	},
	'2025_Snooker_WC_Final_3': {
		programName: "2025世界斯诺克锦标赛决赛(第三阶段)",
		programDescription:
			"2025年世界斯诺克锦标赛决赛(第三阶段)，中国选手赵心童对阵马克·威廉姆斯，第三阶段结束，大比分来到17-8，赵心童继续扩大领先优势，基本锁定冠军。",
	},
	'2025_Snooker_WC_Final_4': {
		programName: "2025世界斯诺克锦标赛决赛(第四阶段)",
		programDescription:
			"2025年世界斯诺克锦标赛决赛(第四阶段)，中国选手赵心童对阵马克·威廉姆斯，最终，赵心童以18-12击败马克·威廉姆斯，获得冠军，成为中国和亚洲首位世锦赛冠军。",
	},
	// 广告
	'10_no_ad': {
		programName: "10秒视频无广告",
		programDescription:
			"播放无广告的10秒视频",
	},
	'10s':{
		programName: "10秒视频+10秒片头广告",
		programDescription:
			"10秒视频+10秒中插广告，用于演示Streampackage的广告插入功能，10s的广告时间过短，个性化广告时间为15s，默认个性化广告不会被截断，将直接使用在Ad breaks里设置的兜底广告。",
	},
	'30s':{
		programName: "30秒视频+15秒中插广告",
		programDescription:
			"30秒视频+15秒中插广告，设置了在影片播放第10秒时播放15秒个性化广告",
	},
	'60s_1':{
		programName: "60秒视频+30秒片头广告",
		programDescription:
			"60秒视频+30秒片头广告，在视频的开头插入30秒片头广告，其中前15秒为个性化广告，后15秒为兜底广告。",
	},
	'60s_2':{
		programName: "60秒视频+30秒中插广告",
		programDescription:
			"60秒视频+30秒中插广告，设置了在影片播放第30秒时播放60秒个性化广告，其中前15秒为个性化广告，后45秒为兜底广告。",
	},
	// nba 
	'g1': {
		programName: "2023-2024赛季 NBA 总决赛第一场",
		programDescription:
			"2023-2024赛季 NBA 总决赛第一场，凯尔特人 vs 独行侠，比赛精彩纷呈，凯尔特人最终以107-89战胜独行侠，系列赛总比分1-0领先。",
	},
	'g2': {
		programName: "2023-2024赛季 NBA 总决赛第二场",
		programDescription:
			"2023-2024赛季 NBA 总决赛第二场，凯尔特人 vs 独行侠，比赛精彩纷呈，凯尔特人最终以105-98战胜独行侠，系列赛总比分2-0领先。",
	},
	'g3': {
		programName: "2023-2024赛季 NBA 总决赛第三场",
		programDescription:
			"2023-2024赛季 NBA 总决赛第三场，凯尔特人 vs 独行侠，比赛精彩纷呈，凯尔特人最终以106-99战胜独行侠，系列赛总比分3-0领先，基本锁定总冠军。",
	},
	'g4': {
		programName: "2023-2024赛季 NBA 总决赛第四场",
		programDescription:
			"2023-2024赛季 NBA 总决赛第四场，凯尔特人 vs 独行侠，比赛精彩纷呈，凯尔特人以84-122不敌独行侠，系列赛总比分3-1，独行侠扳回一城。",
	},
	'g5': {
		programName: "2023-2024赛季 NBA 总决赛第五场",
		programDescription:
			"2023-2024赛季 NBA 总决赛第五场，凯尔特人 vs 独行侠，比赛精彩纷呈，凯尔特人最终以106-88战胜独行侠，系列赛总比分4-1夺冠。",
	},
}