import { Head, router } from "@inertiajs/react";
import { RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import TableSummary from "@/components/commons/table-summary";
import TableTextSearch from "@/components/commons/table-text-search";
import YearSelectFilter from "@/components/commons/year-select-filter";
import RekapInputBulanansTable from "@/components/rekap/input-bulanan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { yearsList } from "@/lib/utils";
import rekap from "@/routes/rekap";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { LockTransaksiInput } from "@/types/lock-transaksi-input";
import type { RekapBulananFilters, RekapInputTahunan } from "@/types/rekap-tahunan";
import type { ReportType } from "@/types/report-type";
import type { TransaksiInput } from "@/types/transaksi-inputs";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Reports", href: "#" },
    { title: "Rekap Bulanan", href: "#" },
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
        const nextUrl = qs ? `${rekap.rekapBulanan().url}?${qs}` : rekap.rekapBulanan().url;

        router.visit(nextUrl, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, []);

    const resetAll = useCallback(() => {
        router.visit(rekap.rekapBulanan().url, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    }, []);

    return { updateAndVisit, resetAll };
};

interface RekapBulanansFiltersProps {
    filters: RekapBulananFilters;
}

const RekapBulanansFilters = memo(({ filters }: RekapBulanansFiltersProps) => {
    const { updateAndVisit, resetAll } = useFilters();

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

interface RekapBulanansProps {
    page: Pagination<TransaksiInput>;
    aspects: Aspect[];
    reportTypes: ReportType[];
    rekap: RekapInputTahunan[];
    lockTransaksiInputs: LockTransaksiInput[];
    filters: RekapBulananFilters;
}

const RekapBulanans = ({ page, aspects, reportTypes, rekap, lockTransaksiInputs, filters }: RekapBulanansProps) => {
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
                                Rekap Perhitungan Input Bulan Tahun <span className="font-medium text-foreground">{filters.year}</span>
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
                            rekap={rekap}
                            lockTransaksiInputs={lockTransaksiInputs}
                            year={filters.year} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default RekapBulanans;
