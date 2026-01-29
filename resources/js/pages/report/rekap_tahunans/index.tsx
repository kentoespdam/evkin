import { Head, router } from "@inertiajs/react";
import { RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import TableTextSearch from "@/components/commons/table-text-search";
import RekapInputTahunansTable from "@/components/reports/table/rekap_input_tahunans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { yearsList } from "@/lib/utils";
import { rekapTahunan } from "@/routes/report";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { RekapInputTahunan, RekapInputTahunanFilters } from "@/types/rekap-tahunan";

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
        const nextUrl = qs ? `${rekapTahunan.url()}?${qs}` : rekapTahunan.url();

        router.visit(nextUrl, { preserveScroll: true, preserveState: true, replace: true });
    }, []);

    const resetAll = useCallback(() => {
        router.visit(rekapTahunan.url(), { preserveScroll: true, preserveState: false, replace: true });
    }, []);

    return { updateAndVisit, resetAll };
};

interface RekapTahunansProps {
    page: Pagination<RekapInputTahunan>;
    filters: RekapInputTahunanFilters;
}

const RekapTahunansFilters = memo(({ filters }: { filters: RekapInputTahunanFilters }) => {
    const { updateAndVisit, resetAll } = useFilters();

    const years = useMemo(() => {
        const now = new Date();
        return yearsList(now.getFullYear() - 5, now.getFullYear() + 1);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasRequiredParams = params.has("fromYear") && params.has("toYear");

        if (!hasRequiredParams) {
            router.visit(rekapTahunan.url(), {
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

    return (
        <div className="flex flex-wrap items-center gap-2">
            <TableTextSearch
                params={{ search: filters.search ?? "" }}
                handleSelectChange={(v) => updateAndVisit("search", v.search ?? "")}
                text="Indikator"
                className="w-full sm:max-w-sm"
            />

            <Label>From</Label>
            <Select
                name="fromYear"
                defaultValue={filters.fromYear?.toString()}
                onValueChange={(v) => updateAndVisit("fromYear", v)}
            >
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
            <Label>to</Label>
            <Select
                name="toYear"
                defaultValue={filters.toYear?.toString()}
                onValueChange={(v) => updateAndVisit("toYear", v)}
            >
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
RekapTahunansFilters.displayName = "RekapTahunansFilters";

const RekapTahunans = ({ page, filters }: RekapTahunansProps) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Tahunan" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Rekap Tahunan</CardTitle>
                            <CardDescription>
                                Rekap Perhitungan Input Tahun{" "}
                                <span>
                                    {filters.fromYear} - {filters.toYear}
                                </span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RekapTahunansFilters filters={filters} />
                        <RekapInputTahunansTable page={page} filters={filters} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default RekapTahunans;
