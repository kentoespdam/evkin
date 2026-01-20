import { Head, router } from "@inertiajs/react";
import { RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import PaginationNav from "@/components/commons/pagination-nav";
import TableTextSearch from "@/components/commons/table-text-search";
import PerhitunganReportsTable from "@/components/reports/table/perhitungan_reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { monthsList, yearsList } from "@/lib/utils";
import type { BreadcrumbItem } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportsDetailProps } from "@/types/perhitungan-reports";
import type { ReportType } from "@/types/report-types";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Reports", href: "#" },
    { title: "Perhitungan", href: "#" },
];

const useFilters = (baseUrl: string) => {
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

const Filters = memo(
    ({
        baseUrl,
        filters,
        reportTypes,
        aspects,
    }: {
        baseUrl: string;
        filters: PerhitunganReportsDetailProps["filters"];
        reportTypes: ReportType[];
        aspects: Aspect[];
    }) => {
        const { updateAndVisit, resetAll } = useFilters(baseUrl);

        const [years, months] = useMemo(() => {
            const now = new Date();
            return [yearsList(now.getFullYear() - 5, now.getFullYear() + 1), monthsList()];
        }, []);

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

                    <Select name="year" defaultValue={filters.year?.toString()} onValueChange={v => updateAndVisit("year", v)}>
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

                    <Button onClick={resetAll} className="gap-2" aria-label="Reset filters">
                        <RefreshCwIcon className="size-4" /> Reset
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
    },
);
Filters.displayName = "Filters";

const PerhitunganReportsDetail = ({ page, reportTypes, aspects, filters }: PerhitunganReportsDetailProps) => {
    const baseUrl = useMemo(() => "/report/perhitungan-reports/detail", []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.get("year") && !params.get("month") && !params.get("report_type_id")) {
            router.visit(baseUrl, {
                data: {
                    year: filters.year,
                    month: filters.month,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    }, [filters, baseUrl]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perhitungan Reports" />

            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Perhitungan Reports</CardTitle>
                            <CardDescription>Calculated report values with filters</CardDescription>
                        </div>
                        {/* Optional export buttons could go here */}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Filters baseUrl={baseUrl} filters={filters} reportTypes={reportTypes} aspects={aspects} />

                        <PerhitunganReportsTable page={page} />

                        <PaginationNav page={page} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default PerhitunganReportsDetail;
