import { router } from "@inertiajs/react";
import { Fragment, memo, useCallback, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, monthsList } from "@/lib/utils";
import { perhitunganReports } from "@/routes/report";
import type { PerhitunganReportDetail, PerhitunganReportProps } from "@/types/perhitungan-reports";

type MonthOption = ReturnType<typeof monthsList>[number];

// 1. Gunakan useCallback untuk event handler jika ada
// 2. Optimasi memoization komponen yang benar-benar perlu

const NilaiPencapaianHeaderCellBuilder = memo(({ className }: { className?: string }) => (
    <>
        <TableHead className={cn("text-center border whitespace-pre-wrap text-sm", className)}>
            Nilai Pencapaian
        </TableHead>
        <TableHead className={cn("text-center border whitespace-pre-wrap text-sm", className)}>
            Nilai Indikator
        </TableHead>
    </>
));
NilaiPencapaianHeaderCellBuilder.displayName = "NilaiPencapaianHeaderCellBuilder";

// 3. Ekstrak fungsi utilitas untuk styling yang sering digunakan
const getMonthCellClassName = (monthValue: number) =>
    cn("text-center border", monthValue % 2 === 1 ? "bg-yellow-100" : "");

const PerhitunganReportsTableHeader = memo(({ year, months }: { year: number; months: MonthOption[] }) => {
    // 4. Hindari inline functions dalam render
    const renderMonthHeaders = useCallback(
        () =>
            months.map((month) => (
                <TableHead key={month.value} className={getMonthCellClassName(month.value)} colSpan={2}>
                    {month.label} {year}
                </TableHead>
            )),
        [months, year],
    );

    const renderNilaiHeaders = useCallback(
        () =>
            months.map((month) => (
                <NilaiPencapaianHeaderCellBuilder key={month.value} className={month.value % 2 === 1 ? "bg-yellow-100" : ""} />
            )),
        [months],
    );

    return (
        <TableHeader>
            <TableRow>
                <TableHead className="border text-center" rowSpan={2}>
                    NO
                </TableHead>
                <TableHead className="border text-center px-42" rowSpan={2}>
                    INDIKATOR
                </TableHead>
                <TableHead className="border text-center px-42" rowSpan={2}>
                    RUMUS
                </TableHead>
                <TableHead className="border text-center" rowSpan={2}>
                    BOBOT
                </TableHead>
                {renderMonthHeaders()}
                <TableHead className="border text-center bg-yellow-100" colSpan={2}>
                    Desember {year - 1}
                </TableHead>
            </TableRow>
            <TableRow>
                {renderNilaiHeaders()}
                <NilaiPencapaianHeaderCellBuilder className="bg-yellow-100" />
            </TableRow>
        </TableHeader>
    );
});
PerhitunganReportsTableHeader.displayName = "PerhitunganReportsTableHeader";

// 5. Optimasi pencarian report dengan Map
const createReportsMap = (reports: PerhitunganReportDetail[]) => {
    const map = new Map<string, PerhitunganReportDetail>();
    reports.forEach((report) => {
        const key = `${report.masterReport.id}-${report.month}-${report.year}`;
        map.set(key, report);
    });
    return map;
};

const NilaiPencapaianCellBuilder = memo(
    ({
        className,
        reportsMap,
        year,
        month,
        masterReportId,
    }: {
        className?: string;
        reportsMap: Map<string, PerhitunganReportDetail>;
        year: number;
        month: number;
        masterReportId: string;
    }) => {
        const key = `${masterReportId}-${month}-${year}`;
        const report = reportsMap.get(key);

        return (
            <>
                <TableCell className={cn("border text-center text-xs", className)}>{report?.nilai ?? "-"}</TableCell>
                <TableCell className={cn("border text-center text-xs", className)}>{report?.nilaiIndicator ?? "-"}</TableCell>
            </>
        );
    },
);
NilaiPencapaianCellBuilder.displayName = "NilaiPencapaianCellBuilder";

interface PerhitunganReportsTableBodyProps {
    groupedReports: {
        aspect: PerhitunganReportProps["aspects"][number];
        masterReports: PerhitunganReportProps["masterReports"][number][];
    }[];
    reportsMap: Map<string, PerhitunganReportDetail>;
    months: MonthOption[];
    year: number;
}

const PerhitunganReportsTableBody = memo(({ groupedReports, reportsMap, months, year }: PerhitunganReportsTableBodyProps & { year: number }) => {
    // 6. Hindari inline functions dalam map dengan useCallback
    const renderRowClassName = useCallback((index: number) => cn(index % 2 === 1 ? "bg-slate-50/50" : ""), []);

    const renderFormulaCell = useCallback(
        (item: PerhitunganReportProps["masterReports"][number]) => item.descFormula || item.formula,
        [],
    );

    const renderMonthCells = useCallback(
        (item: PerhitunganReportProps["masterReports"][number]) => {
            const withDesember = Array.from({ length: 13 })
                .map((_, i) => ({
                    month: i === 12 ? 12 : i + 1,
                    year: i === 12 ? year - 1 : year,
                }));
            return withDesember.map((wd) => (
                <NilaiPencapaianCellBuilder
                    key={`${item.id}-${wd.month}-${wd.year}`}
                    className={cn(
                        wd.month % 2 === 1 && "bg-yellow-100",
                        wd.month === 12 && wd.year === year - 1 && "bg-yellow-100"
                    )}
                    reportsMap={reportsMap}
                    month={wd.month}
                    masterReportId={item.id}
                    year={wd.year}
                />
            ))
        },
        [reportsMap, year],
    );

    return (
        <TableBody>
            {groupedReports.map(({ aspect, masterReports }) => (
                <Fragment key={aspect.id}>
                    <TableRow className="bg-slate-50">
                        <TableCell className="border font-semibold uppercase px-12" colSpan={6 + months.length * 2}>
                            {aspect.name}
                        </TableCell>
                    </TableRow>
                    {masterReports.map((item, index) => (
                        <TableRow key={item.id} className={renderRowClassName(index)}>
                            <TableCell className="border text-center">{item.urut}</TableCell>
                            <TableCell className="border whitespace-pre-wrap">{item.descIndicator}</TableCell>
                            <TableCell className="border text-center whitespace-pre-wrap">{renderFormulaCell(item)}</TableCell>
                            <TableCell className="border text-center">{item.weight}</TableCell>
                            {renderMonthCells(item)}
                        </TableRow>
                    ))}
                </Fragment>
            ))}
        </TableBody>
    );
});
PerhitunganReportsTableBody.displayName = "PerhitunganReportsTableBody";

const PerhitunganReportsTable = ({
    masterReports,
    aspects,
    reports,
    filters,
}: Omit<PerhitunganReportProps, "reportTypes">) => {
    const months = useMemo(() => monthsList(), []);

    // 7. Optimasi groupedReports dengan reduce
    const groupedReports = useMemo(() => {
        const aspectMap = new Map<
            string,
            {
                aspect: PerhitunganReportProps["aspects"][number];
                masterReports: PerhitunganReportProps["masterReports"][number][];
            }
        >();

        aspects.forEach((aspect) => {
            const filteredReports = masterReports
                .filter((report) => report.aspect?.id === aspect.id)
                .sort((a, b) => a.urut - b.urut);

            if (filteredReports.length > 0) {
                aspectMap.set(aspect.id, {
                    aspect,
                    masterReports: filteredReports,
                });
            }
        });

        return Array.from(aspectMap.values());
    }, [aspects, masterReports]);

    // 8. Gunakan Map untuk reports agar pencarian lebih cepat
    const reportsMap = useMemo(() => createReportsMap(reports), [reports]);

    // 9. Optimasi useEffect dengan dependency yang lebih spesifik
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasRequiredParams = params.get("year") || params.get("month") || params.get("report_type_id");

        if (!hasRequiredParams) {
            router.visit(perhitunganReports.url(), {
                data: {
                    year: filters.year,
                    report_type_id: filters.report_type_id,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    }, [filters.year, filters.report_type_id]); // 10. Hanya depend on yang diperlukan

    // 11. Early return jika tidak ada data
    if (groupedReports.length === 0) {
        return <div className="p-4 text-center text-gray-500">Tidak ada data yang ditemukan</div>;
    }

    return (
        <div className="overflow-auto">
            <Table>
                <PerhitunganReportsTableHeader year={filters.year} months={months} />
                <PerhitunganReportsTableBody
                    groupedReports={groupedReports}
                    reportsMap={reportsMap}
                    months={months}
                    year={filters.year} />
            </Table>
        </div>
    );
};

export default memo(PerhitunganReportsTable);
