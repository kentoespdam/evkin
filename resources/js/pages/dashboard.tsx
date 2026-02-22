import { Head, usePage } from "@inertiajs/react";
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { ActivityIcon, BarChart3Icon, ClockIcon, FileTextIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import type { BreadcrumbItem, SharedData } from "@/types";
import type { DashboardData } from "@/types/dashboard";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Beranda",
		href: dashboard().url,
	},
];

export interface DashboardProps {
	data: DashboardData;
}

export default function Dashboard({ data }: DashboardProps) {
	const { isAdmin } = usePage<SharedData>().props;

	// Chart.js line chart data (Performance Trends)
	const trendChartData = {
		labels: data.trends.map((t) => t.month),
		datasets: [
			{
				label: "Performance (%)",
				data: data.trends.map((t) => t.performance),
				borderColor: "rgb(59, 130, 246)",
				backgroundColor: "rgba(59, 130, 246, 0.1)",
				tension: 0.4,
				fill: true,
			},
		],
	};

	const trendChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	// Chart.js doughnut chart data (Aspect Breakdown)
	const aspectChartData = {
		labels: data.aspectBreakdown.map((a) => a.aspect),
		datasets: [
			{
				label: "Score",
				data: data.aspectBreakdown.map((a) => a.score),
				backgroundColor: [
					"rgba(59, 130, 246, 0.8)",
					"rgba(16, 185, 129, 0.8)",
					"rgba(245, 158, 11, 0.8)",
					"rgba(239, 68, 68, 0.8)",
					"rgba(139, 92, 246, 0.8)",
					"rgba(236, 72, 153, 0.8)",
				],
				borderWidth: 2,
				borderColor: "#fff",
			},
		],
	};

	const aspectChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "right" as const,
			},
		},
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Dashboard" />
			<div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{isAdmin && (
						<StatCard
							title="Total Users"
							value={data.stats.totalUsers || 0}
							description="Registered users"
							icon={UsersIcon}
							iconClassName="text-blue-500"
						/>
					)}
					<StatCard
						title="Inputs This Month"
						value={data.stats.inputsThisMonth}
						description={`Total nilai: ${data.stats.inputsValueSum.toLocaleString()}`}
						icon={ActivityIcon}
						iconClassName="text-green-500"
					/>
					<StatCard
						title="Reports Calculated"
						value={data.stats.reportsThisMonth}
						description="This month"
						icon={FileTextIcon}
						iconClassName="text-orange-500"
					/>
					<StatCard
						title="Avg Performance"
						value={`${data.stats.averagePerformance}%`}
						description="Current period"
						icon={TrendingUpIcon}
						iconClassName="text-purple-500"
					/>
				</div>

				{/* Input Completion Progress */}
				<Card>
					<CardHeader>
						<CardTitle>Input Completion Rate</CardTitle>
						<CardDescription>
							{data.inputCompletion.completed} of {data.inputCompletion.total} inputs completed for current month
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Progress value={data.inputCompletion.percentage} className="h-3" />
						<p className="text-right text-sm font-medium">{data.inputCompletion.percentage.toFixed(1)}%</p>
					</CardContent>
				</Card>

				{/* Charts Row */}
				<div className="grid gap-4 lg:grid-cols-2">
					{/* Performance Trends Chart */}
					<ChartCard title="Performance Trends" description="Last 12 months performance overview">
						<div className="h-[300px]">
							<Line data={trendChartData} options={trendChartOptions} />
						</div>
					</ChartCard>

					{/* Aspect Breakdown Chart */}
					<ChartCard title="Aspect Breakdown" description="Score distribution by aspect">
						<div className="h-[300px]">
							{data.aspectBreakdown.length > 0 ? (
								<Doughnut data={aspectChartData} options={aspectChartOptions} />
							) : (
								<div className="flex h-full items-center justify-center text-muted-foreground">
									No data available for current period
								</div>
							)}
						</div>
					</ChartCard>
				</div>

				{/* Recent Activities & Pending Periods */}
				<div className="grid gap-4 lg:grid-cols-3">
					{/* Recent Activities */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>Recent Activities</CardTitle>
							<CardDescription>Latest transaction inputs</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Periode</TableHead>
										<TableHead>Indicator</TableHead>
										<TableHead className="text-right">Nilai</TableHead>
										<TableHead className="text-right">Updated</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.recentActivities.length > 0 ? (
										data.recentActivities.map((activity) => (
											<TableRow key={activity.id}>
												<TableCell>
													<Badge variant="outline">{activity.periode}</Badge>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium">{activity.masterInput.kode}</p>
														<p className="text-xs text-muted-foreground">{activity.masterInput.description}</p>
													</div>
												</TableCell>
												<TableCell className="text-right font-medium">
													{activity.nilai.toLocaleString()} {activity.masterInput.satuan}
												</TableCell>
												<TableCell className="text-right text-sm text-muted-foreground">{activity.updatedAt}</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={4} className="text-center text-muted-foreground">
												No recent activities
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					{/* Pending Periods */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ClockIcon className="size-4" />
								Pending Periods
							</CardTitle>
							<CardDescription>{data.pendingPeriods.length} unlocked period(s)</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{data.pendingPeriods.length > 0 ? (
									data.pendingPeriods.map((period) => (
										<div
											key={`${period.year}-${period.month}`}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div>
												<p className="font-medium">{period.periode}</p>
												<p className="text-xs text-muted-foreground">
													{period.year} - {period.month.toString().padStart(2, "0")}
												</p>
											</div>
											<Badge variant="secondary">Unlocked</Badge>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground">All periods are locked</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Users by Role (Admin Only) */}
				{isAdmin && data.stats.usersByRole && data.stats.usersByRole.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Users by Role</CardTitle>
							<CardDescription>Distribution of users across roles</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
								{data.stats.usersByRole.map((role) => (
									<div key={role.role} className="flex items-center justify-between rounded-lg border p-4">
										<div>
											<p className="text-sm text-muted-foreground">{role.role}</p>
											<p className="text-2xl font-bold">{role.count}</p>
										</div>
										<BarChart3Icon className="size-8 text-muted-foreground" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</AppLayout>
	);
}
