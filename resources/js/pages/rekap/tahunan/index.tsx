import { Head } from "@inertiajs/react";
import { memo, useMemo } from "react";
import PaginationNav from "@/components/commons/pagination-nav";
import TableSummary from "@/components/commons/table-summary";
import RekapInputTahunansTable from "@/components/rekap/input-tahunan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInitializeFilters, useYearRangeLaporanTahunan } from "@/hooks/use-rekap-tahunan";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import type { RekapTahunansProps } from "@/types/rekap-tahunan";
import { RekapTahunansFilters } from "./filter";

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Beranda", href: "/dashboard" },
	{ title: "Reports", href: "#" },
	{ title: "Rekap Tahunan", href: "#" },
];

const RekapTahunans = memo(({ page, aspects, reportTypes, rekapData, filters }: RekapTahunansProps) => {
	const { rangeLabel } = useInitializeFilters(filters);
	const yearNow = useMemo(() => new Date().getFullYear(), []);
	const yearSelectFilter = useYearRangeLaporanTahunan(yearNow - 5, yearNow);

	const pageTitle = "Rekap Tahunan";
	const periodDescription = rangeLabel;

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={pageTitle} />
			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="gap-4">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold">{pageTitle}</CardTitle>
							<CardDescription>
								Rekap Perhitungan Input Tahun <span className="font-medium text-foreground">{periodDescription}</span>
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<RekapTahunansFilters filters={filters} years={yearSelectFilter} />
						<TableSummary page={page} />
						<RekapInputTahunansTable
							page={page}
							aspects={aspects}
							reportTypes={reportTypes}
							rekapData={rekapData}
							filters={filters}
						/>
						<PaginationNav page={page} />
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
});

RekapTahunans.displayName = "RekapTahunans";

export default RekapTahunans;
