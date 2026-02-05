import { router } from "@inertiajs/react";
import { RefreshCwIcon } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import TableTextSearch from "@/components/commons/table-text-search";
import YearSelectFilter from "@/components/commons/year-select-filter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRekapBulananFilters } from "@/hooks/use-rekap-bulanan";
import { yearsList } from "@/lib/utils";
import rekap from "@/routes/rekap";
import type { RekapBulananFilters } from "@/types/rekap-tahunan";

interface RekapBulanansFiltersProps {
	filters: RekapBulananFilters;
}

const RekapBulanansFilters = memo(({ filters }: RekapBulanansFiltersProps) => {
	const { updateAndVisit, resetAll } = useRekapBulananFilters();

	const years = useMemo(() => {
		const now = new Date();
		return yearsList(now.getFullYear() - 5, now.getFullYear() + 1);
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const hasRequiredParams = params.has("year");

		if (!hasRequiredParams && filters.year) {
			router.visit(rekap.rekapBulanan().url, {
				data: {
					year: filters.year,
				},
				preserveState: true,
				preserveScroll: true,
				replace: true,
			});
		}
	}, [filters.year]);

	return (
		<div className="space-y-4 rounded-lg border bg-muted/20 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="text-sm font-medium">Filter Rekap</p>
					<p className="text-xs text-muted-foreground">Tahun {filters.year}</p>
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
					id="year"
					label="Tahun"
					value={filters.year?.toString() ?? ""}
					onChange={(v) => updateAndVisit("year", v)}
					years={years}
				/>
			</div>
		</div>
	);
});
RekapBulanansFilters.displayName = "RekapBulanansFilters";

export default RekapBulanansFilters;
