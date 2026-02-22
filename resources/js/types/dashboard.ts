export interface DashboardStats {
	totalUsers?: number;
	usersByRole?: {
		role: string;
		count: number;
	}[];
	inputsThisMonth: number;
	inputsValueSum: number;
	reportsThisMonth: number;
	averagePerformance: number;
	pendingPeriods: number;
}

export interface PerformanceTrend {
	month: string;
	year: number;
	monthNum: number;
	performance: number;
}

export interface RecentActivity {
	id: number;
	periode: string;
	year: number;
	month: number;
	nilai: number;
	masterInput: {
		kode: string;
		description: string;
		satuan: string;
	};
	updatedAt: string;
}

export interface AspectBreakdown {
	aspect: string;
	score: number;
}

export interface PendingPeriod {
	year: number;
	month: number;
	periode: string;
}

export interface InputCompletion {
	total: number;
	completed: number;
	percentage: number;
}

export interface DashboardData {
	stats: DashboardStats;
	trends: PerformanceTrend[];
	recentActivities: RecentActivity[];
	aspectBreakdown: AspectBreakdown[];
	pendingPeriods: PendingPeriod[];
	inputCompletion: InputCompletion;
}
