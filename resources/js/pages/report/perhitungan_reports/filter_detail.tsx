import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import { memo, useMemo } from "react";
import TableTextSearch from "@/components/commons/table-text-search";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePerhitunganDetailFilter } from "@/hooks/use-perhitungan-report-detail";
import { useDownloadPolling } from "@/lib/download_helper";
import report from "@/routes/report";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportsDetailProps } from "@/types/perhitungan-reports";
import type { ReportType } from "@/types/report-type";

interface PerhitunganReportDetailFilterProps {
	filters: PerhitunganReportsDetailProps["filters"];
	reportTypes: ReportType[];
	aspects: Aspect[];
}
const PerhitunganReportDetailFilter = memo(({ filters, reportTypes, aspects }: PerhitunganReportDetailFilterProps) => {
	const baseUrl = report.perhitunganReports.detail.url();
	const baseExportUrl = "/report/perhitungan-reports/export";

	const { years, months, updateAndVisit, resetAll } = usePerhitunganDetailFilter();
	const { exportExcel, isExporting } = useDownloadPolling(baseUrl, baseExportUrl);

	const filteredAspects = useMemo(() => {
		const rt = filters.report_type_id;
		if (!rt) return [];
		return aspects.filter((a) => a.reportType?.id === rt);
	}, [aspects, filters.report_type_id]);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
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

				<Select
					disabled={!filters.report_type_id}
					value={filters.aspect_id ?? ""}
					onValueChange={(v) => updateAndVisit("aspect_id", v)}
				>
					<SelectTrigger className="w-fit min-w-48">
						<SelectValue placeholder={filters.report_type_id ? "Filter Aspect" : "Select Report Type first"} />
					</SelectTrigger>
					<SelectContent>
						{filteredAspects.map((a) => (
							<SelectItem key={a.id} value={a.id}>
								{a.name}
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

				<Select defaultValue={filters.month?.toString()} onValueChange={(v) => updateAndVisit("month", v)}>
					<SelectTrigger className="w-fit">
						<SelectValue placeholder="Month" />
					</SelectTrigger>
					<SelectContent>
						{months.map((m) => (
							<SelectItem key={m.value} value={String(m.value)}>
								{m.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button type="button" onClick={resetAll} className="gap-2" aria-label="Reset filters">
					<RefreshCwIcon className="size-4" /> Reset
				</Button>

				<Button
					type="button"
					onClick={() => exportExcel(filters)}
					disabled={isExporting || !filters.report_type_id}
					className="gap-2"
					aria-label="Download Excel"
				>
					<DownloadIcon className="size-4" />
					{isExporting ? "Downloading..." : "Download Excel"}
				</Button>
			</div>

			<div className="flex items-center justify-between gap-2">
				<TableTextSearch
					params={Object.fromEntries(
						new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").entries(),
					)}
					handleSelectChange={(v) => updateAndVisit("search", v.search ?? "")}
					text="Indicators"
					className="w-full sm:max-w-sm"
				/>
				{/* Show totals via PaginationNav footer text */}
			</div>
		</div>
	);
});
PerhitunganReportDetailFilter.displayName = "Filters";

export default PerhitunganReportDetailFilter;
