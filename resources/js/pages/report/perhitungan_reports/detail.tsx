import { Head, router } from "@inertiajs/react";
import { LockIcon, RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import PaginationNav from "@/components/commons/pagination-nav";
import TableTextSearch from "@/components/commons/table-text-search";
import PerhitunganReportsDetailTable from "@/components/reports/table/perhitungan_report_detail";
import PerhitunganReportDetailFilter from "@/components/reports/table/perhitungan_report_detail/filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePerhitunganDetailFilter } from "@/hooks/user-perhitungan-report-detail";
import AppLayout from "@/layouts/app-layout";
import { monthsList, yearsList } from "@/lib/utils";
import type { BreadcrumbItem } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportsDetailProps } from "@/types/perhitungan-reports";
import type { ReportType } from "@/types/report-type";

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Dashboard", href: "/dashboard" },
	{ title: "Reports", href: "#" },
	{ title: "Perhitungan", href: "#" },
];



const PerhitunganReportsDetail = ({ page, reportTypes, aspects, filters }: PerhitunganReportsDetailProps) => {
	const baseUrl = useMemo(() => "/report/perhitungan-reports/detail", []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (!params.get("year") && !params.get("month") && !params.get("report_type_id")) {
			router.visit(baseUrl, {
				data: {
					year: filters.year,
					month: filters.month,
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
						{/* Optional export buttons could go here */}
					</CardHeader>
					<CardContent className="space-y-6">
						<PerhitunganReportDetailFilter
							filters={filters}
							reportTypes={reportTypes}
							aspects={aspects}
							isEmpty={page.meta.total === 0} />

						<PerhitunganReportsDetailTable page={page} />

						<PaginationNav page={page} />
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
};

export default PerhitunganReportsDetail;
