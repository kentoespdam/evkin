import { Head, router } from "@inertiajs/react";
import { RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import TableSummary from "@/components/commons/table-summary";
import TableTextSearch from "@/components/commons/table-text-search";
import YearSelectFilter from "@/components/commons/year-select-filter";
import RekapInputTahunansTable from "@/components/rekap/input-tahunan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { yearsList } from "@/lib/utils";
import rekap from "@/routes/rekap";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { RekapInputTahunan, RekapInputTahunanFilters } from "@/types/rekap-tahunan";
import type { ReportType } from "@/types/report-type";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Reports", href: "#" },
    { title: "Rekap Tahunan", href: "#" },
];

const useFilters = () => {
    const updateAndVisit = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        if (!value.trim()) {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        const qs = params.toString();
        const nextUrl = qs ? `${rekap.rekapTahunan().url}?${qs}` : rekap.rekapTahunan().url;

        router.visit(nextUrl, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, []);

    const resetAll = useCallback(() => {
        router.visit(rekap.rekapTahunan().url, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    }, []);

    return { updateAndVisit, resetAll };
};

// Custom hook untuk tahun range
export const useYearRangeLaporanTahunan = (fromYear: number, toYear: number) => {
    return useMemo(() => {
        return yearsList(fromYear, toYear);
    }, [fromYear, toYear]);
};

interface RekapTahunansFiltersProps {
    filters: RekapInputTahunanFilters;
}

const RekapTahunansFilters = memo(({ filters }: RekapTahunansFiltersProps) => {
    const { updateAndVisit, resetAll } = useFilters();

    const years = useYearRangeLaporanTahunan(filters.fromYear, filters.toYear);

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

    const rangeLabel = useMemo(() => `${filters.fromYear} - ${filters.toYear}`, [filters.fromYear, filters.toYear]);

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
            </div>
        </div>
    );
});
RekapTahunansFilters.displayName = "RekapTahunansFilters";

interface RekapTahunansProps {
    page: Pagination<RekapInputTahunan>;
    aspects: Aspect[];
    reportTypes: ReportType[];
    filters: RekapInputTahunanFilters;
}

const RekapTahunans = ({ page, aspects, reportTypes, filters }: RekapTahunansProps) => {
    const pageTitle = useMemo(() => "Rekap Tahunan", []);
    const periodDescription = useMemo(() =>
        `${filters.fromYear} - ${filters.toYear}`,
        [filters.fromYear, filters.toYear]
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">{pageTitle}</CardTitle>
                            <CardDescription>
                                Rekap Perhitungan Input Tahun{" "}
                                <span className="font-medium text-foreground">
                                    {periodDescription}
                                </span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RekapTahunansFilters filters={filters} />
                        <TableSummary page={page} />
                        <RekapInputTahunansTable
                            page={page}
                            aspects={aspects}
                            reportTypes={reportTypes}
                            filters={filters} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default RekapTahunans;
