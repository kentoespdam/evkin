import { Head } from "@inertiajs/react";
import { useMemo } from "react";
import PerhitunganReports from "@/components/reports/table/perhitungan_report";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import type { PerhitunganReportProps } from "@/types/perhitungan-reports";
import PerhitunganReportIndexFilter from "./filter_index";

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Beranda", href: "/dashboard" },
	{ title: "Laporan", href: "#" },
];

const ReportPerhitungan = ({ masterReports, reportTypes, aspects, reports, filters }: PerhitunganReportProps) => {
	const jenisReport = useMemo(() => reportTypes.find((rt) => rt.id === filters.report_type_id) ?? reportTypes[0], [filters, reportTypes]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Laporan Perhitungan" />
			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold">
								Laporan <span className="uppercase">{jenisReport?.name}</span> -{" "}
								<span className="font-semibold">{filters.year}</span>
							</CardTitle>
							<CardDescription>
								Hasil perhitungan Laporan <span className="uppercase">{jenisReport?.name}</span> tahun:{" "}
								<span>{filters.year}</span>
							</CardDescription>
						</div>
						{/* Optional export buttons could go here */}
					</CardHeader>
					<CardContent className="space-y-6">
						<PerhitunganReportIndexFilter filters={filters} reportTypes={reportTypes} />
						<PerhitunganReports
							aspects={aspects}
							masterReports={masterReports}
							reportTypes={jenisReport}
							reports={reports}
							year={filters.year}
						/>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
};

export default ReportPerhitungan;
