import { Head } from "@inertiajs/react";
import { useMemo } from "react";
import TableSummary from "@/components/commons/table-summary";
import RekapInputBulanansTable from "@/components/rekap/input-bulanan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import type { RekapBulanansProps } from "@/types/transaksi-inputs";
import RekapBulanansFilters from "./filter";

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Dashboard", href: "/dashboard" },
	{ title: "Reports", href: "#" },
	{ title: "Rekap Bulanan", href: "#" },
];

const RekapBulanans = ({
	page,
	aspects,
	reportTypes,
	rekapData,
	rekapTahunan,
	lockTransaksiInputs,
	filters,
}: RekapBulanansProps) => {
	const pageTitle = useMemo(() => "Rekap Bulanan", []);
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={pageTitle} />
			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="gap-4">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold">{pageTitle}</CardTitle>
							<CardDescription>
								Rekap Perhitungan Input Bulanan Tahun{" "}
								<span className="font-medium text-foreground">{filters.year}</span>
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<RekapBulanansFilters filters={filters} />
						<TableSummary page={page} />
						<RekapInputBulanansTable
							page={page}
							aspects={aspects}
							reportTypes={reportTypes}
							rekapData={rekapData}
							rekapTahunan={rekapTahunan}
							lockTransaksiInputs={lockTransaksiInputs}
							filters={filters}
						/>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
};

export default RekapBulanans;
