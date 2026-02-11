import { router } from "@inertiajs/react";
import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import { memo, useEffect } from "react";
import TableTextSearch from "@/components/commons/table-text-search";
import YearSelectFilter from "@/components/commons/year-select-filter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRekapTahunanFilters } from "@/hooks/use-rekap-tahunan";
import { useDownloadPolling } from "@/lib/download_helper";
import rekap from "@/routes/rekap";
import type { RekapTahunansFiltersProps } from "@/types/rekap-tahunan";

export const RekapTahunansFilters = memo(({ filters, years }: RekapTahunansFiltersProps) => {
	const baseUrl = rekap.rekapTahunan.url();
	const baseExportUrl = "/rekap/export";

	const { updateAndVisit, resetAll } = useRekapTahunanFilters();
	const { exportExcel, isExporting } = useDownloadPolling(baseUrl, baseExportUrl);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const hasRequiredParams = params.has("fromYear") && params.has("toYear");

		if (!hasRequiredParams && filters.fromYear && filters.toYear) {
			router.visit(rekap.rekapTahunan().url, {
				data: {
					fromYear: filters.fromYear,
					toYear: filters.toYear,
				},
				preserveState: true,
				preserveScroll: true,
				replace: true,
			});
		}
	}, [filters.fromYear, filters.toYear]);

	const rangeLabel = `${filters.fromYear} - ${filters.toYear}`;

	return (
		<div className="space-y-4 rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="text-sm font-medium">Filter Rekap</p>
					<p className="text-xs text-muted-foreground">Periode {rangeLabel}</p>
				</div>
				<Button variant="outline" size="sm" onClick={resetAll} className="gap-2" aria-label="Reset filters">
					<RefreshCwIcon className="size-4" />
					<span>Reset</span>
				</Button>
			</div>
			<Separator />
			<div className="flex flex-wrap items-end gap-3">
				<TableTextSearch
					params={{ search: filters.search ?? "" }}
					handleSelectChange={(v) => updateAndVisit("search", v.search ?? "")}
					text="Indikator"
					className="w-full sm:max-w-sm"
				/>

				<YearSelectFilter
					id="fromYear"
					label="From"
					value={filters.fromYear?.toString() ?? ""}
					onChange={(v) => updateAndVisit("fromYear", v)}
					years={years}
				/>

				<YearSelectFilter
					id="toYear"
					label="To"
					value={filters.toYear?.toString() ?? ""}
					onChange={(v) => updateAndVisit("toYear", v)}
					years={years}
				/>

				<Button
					type="button"
					onClick={() => exportExcel(filters)}
					disabled={isExporting || !filters.fromYear || !filters.toYear}
					className="gap-2"
					aria-label="Download Excel"
				>
					<DownloadIcon className="size-4" />
					{isExporting ? "Downloading..." : "Download Excel"}
				</Button>
			</div>
		</div>
	);
});

RekapTahunansFilters.displayName = "RekapTahunansFilters";
