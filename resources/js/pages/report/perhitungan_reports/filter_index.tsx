import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import { memo, useMemo } from "react";
import TableTextSearch from "@/components/commons/table-text-search";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePerhitunganIndexFilter } from "@/hooks/use-perhitungan-report-index";
import { useDownloadPolling } from "@/lib/download_helper";
import { yearsList } from "@/lib/utils";
import report from "@/routes/report";
import type { PerhitunganReportFilters } from "@/types/perhitungan-reports";
import type { ReportType } from "@/types/report-type";

const PerhitunganReportIndexFilter = memo(
    ({ filters, reportTypes }: { filters: PerhitunganReportFilters; reportTypes: ReportType[] }) => {
        const baseUrl = report.perhitunganReports.url();
        const baseExportUrl = "/report/perhitungan-reports/export";

        const { updateAndVisit, resetAll } = usePerhitunganIndexFilter();
        const { exportExcel, isExporting } = useDownloadPolling(baseUrl, baseExportUrl);

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
        );
    },
);
PerhitunganReportIndexFilter.displayName = "Filters";

export default PerhitunganReportIndexFilter;
