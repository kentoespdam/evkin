import { Head, router } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import PaginationNav from "@/components/commons/pagination-nav";
import PerhitunganReportsDetailTable from "@/components/reports/table/perhitungan_report_detail";
import PerhitunganReportDetailFilter from "@/components/reports/table/perhitungan_report_detail/filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import report from "@/routes/report";
import type { PerhitunganReportsDetailProps } from "@/types/perhitungan-reports";

const useBreadcrumbs = () =>
	useMemo(
		() => [
			{ title: "Dashboard", href: "/dashboard" },
			{ title: "Reports", href: "#" },
			{ title: "Perhitungan", href: "#" },
		],
		[],
	);

const PerhitunganReportsDetail = ({ page, reportTypes, aspects, filters }: PerhitunganReportsDetailProps) => {
	const baseUrl = useMemo(() => report.perhitunganReports.detail.url(), []);
	const breadcrumbs = useBreadcrumbs();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (!params.get("year") && !params.get("month") && !params.get("report_type_id")) {
			router.visit(baseUrl, {
				data: {
					year: filters.year,
					month: filters.month,
					report_type_id: filters.report_type_id,
				},
				preserveState: true,
				preserveScroll: true,
				replace: true,
			});
		}
	}, [filters, baseUrl]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Perhitungan Reports" />

			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold">Perhitungan Reports</CardTitle>
							<CardDescription>Calculated report values with filters</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<PerhitunganReportDetailFilter filters={filters} reportTypes={reportTypes} aspects={aspects} />

						<PerhitunganReportsDetailTable page={page} />

						<PaginationNav page={page} />
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
};

export default PerhitunganReportsDetail;
