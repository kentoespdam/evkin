import { Head, router } from "@inertiajs/react";
import { RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import TableTextSearch from "@/components/commons/table-text-search";
import TemplateBuilder from "@/components/reports/table/perhitungan_report_builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { yearsList } from "@/lib/utils";
import { perhitunganReports } from "@/routes/report";
import type { BreadcrumbItem } from "@/types";
import type { PerhitunganReportFilters, PerhitunganReportProps } from "@/types/perhitungan-reports";
import type { ReportType } from "@/types/report-type";

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Dashboard", href: "/dashboard" },
	{ title: "Reports", href: "#" },
];

const useFilters = () => {
	const baseUrl = perhitunganReports.url();
	const updateAndVisit = useCallback(
		(key: string, value: string) => {
			const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

			if (!value.trim()) {
				params.delete(key);
			} else {
				params.set(key, value);
			}

			// Reset aspect when report type changes
			if (key === "report_type_id") {
				params.delete("aspect_id");
			}

			// Changing filters should reset to first page
			params.delete("page");

			const qs = params.toString();
			const nextUrl = qs ? `${baseUrl}?${qs}` : baseUrl;

			router.visit(nextUrl, { preserveScroll: true, preserveState: true, replace: true });
		},
		[baseUrl],
	);

	const resetAll = useCallback(() => {
		router.visit(baseUrl, { preserveScroll: true, preserveState: false, replace: true });
	}, [baseUrl]);

	return { updateAndVisit, resetAll };
};

const Filters = memo(({ filters, reportTypes }: { filters: PerhitunganReportFilters; reportTypes: ReportType[] }) => {
	const { updateAndVisit, resetAll } = useFilters();

	const years = useMemo(() => {
		const now = new Date();
		return yearsList(now.getFullYear() - 5, now.getFullYear() + 1);
	}, []);

	return (
		<div className="flex flex-wrap items-center gap-2">
			<TableTextSearch
				params={{ search: filters.search ?? "" }}
				handleSelectChange={(v) => updateAndVisit("search", v.search ?? "")}
				text="Indicators"
				className="w-full sm:max-w-sm"
			/>

			<Select value={filters.report_type_id ?? ""} onValueChange={(v) => updateAndVisit("report_type_id", v)}>
				<SelectTrigger className="w-fit min-w-48">
					<SelectValue placeholder="Filter Report Type" />
				</SelectTrigger>
				<SelectContent>
					{reportTypes.map((rt) => (
						<SelectItem key={rt.id} value={rt.id}>
							{rt.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select name="year" defaultValue={filters.year?.toString()} onValueChange={(v) => updateAndVisit("year", v)}>
				<SelectTrigger className="w-fit">
					<SelectValue placeholder="Select year" />
				</SelectTrigger>
				<SelectContent>
					{years.map((year) => (
						<SelectItem key={year} value={year.toString()}>
							{year}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Button onClick={resetAll} className="gap-2" aria-label="Reset filters">
				<RefreshCwIcon className="size-4" /> Reset
			</Button>
		</div>
	);
});
Filters.displayName = "Filters";

const ReportPerhitungan = ({ masterReports, reportTypes, aspects, reports, filters }: PerhitunganReportProps) => {
	const jenisReport = useMemo(() => reportTypes.find((rt) => rt.id === filters.report_type_id), [filters, reportTypes]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Perhitungan Reports" />
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
						<Filters filters={filters} reportTypes={reportTypes} />
						<TemplateBuilder
							masterReports={masterReports}
							reportTypes={reportTypes}
							aspects={aspects}
							reports={reports}
							filters={filters}
							templateName={jenisReport?.templateName ?? "TEMPLATE_KEPMENDAGRI"}
						/>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
};

export default ReportPerhitungan;
