import { memo } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BORDER_CLASS, TEXT_CENTER_CLASS } from "@/lib/component_helper";
import { cn, type MonthOption } from "@/lib/utils";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import NilaiRowBuilder from "./nilai_cell";

interface TableBodyProps {
    masterReports: Report[];
    tahunLaluMap: Map<string, PerhitunganReportDetail>;
    reportsByKey: Map<string, PerhitunganReportDetail>;
    year: number;
    months: MonthOption[];
    templateName: string;
    showUnitColumn?: boolean;
    showFormulaColumn?: boolean;
}

export const RekapTableBody = memo(
    ({
        masterReports,
        tahunLaluMap,
        reportsByKey,
        year,
        months,
        showUnitColumn = true,
        showFormulaColumn = true,
        templateName: jenisReport,
    }: TableBodyProps) => {
        const generateReportKey = (reportId: string, year: number, month: number) => `${reportId}-${year}-${month}`;

        return (
            <TableBody>
                {masterReports.map((mr, index) => {
                    const detailTahunLalu = tahunLaluMap.get(mr.id);

                    return (
                        <TableRow key={mr.id} className="group hover:bg-muted/40 odd:bg-muted/50 odd:hover:bg-muted/50 ">
                            <TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{index + 1}</TableCell>
                            <TableCell className={BORDER_CLASS}>{mr.descIndicator}</TableCell>

                            {showFormulaColumn && (
                                <TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{mr.descFormula}</TableCell>
                            )}

                            {showUnitColumn && <TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{mr.unit}</TableCell>}

                            <TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{mr.weight}</TableCell>

                            {months.map((month) => {
                                const key = generateReportKey(mr.id, year, month.value);
                                const detail = reportsByKey.get(key);
                                return (
                                    <NilaiRowBuilder
                                        key={`${mr.id}-${month.value}`}
                                        monthValue={month.value}
                                        nilai={detail?.nilai}
                                        nilaiIndicator={detail?.nilaiIndicator}
                                        nilaiBobot={detail?.nilaiBobot}
                                        withRules={mr.withRules}
                                        rule={mr.rules || ""}
                                        precision={0}
                                        isOddRow={index % 2 === 0}
                                        templateName={jenisReport}
                                    />
                                );
                            })}

                            <NilaiRowBuilder
                                monthValue={12}
                                nilai={detailTahunLalu?.nilai}
                                nilaiIndicator={detailTahunLalu?.nilaiIndicator}
                                nilaiBobot={detailTahunLalu?.nilaiBobot}
                                withRules={mr.withRules}
                                rule={mr.rules || ""}
                                precision={0}
                                isOddRow={index % 2 === 0}
                                templateName={jenisReport}
                            />
                        </TableRow>
                    );
                })}
            </TableBody>
        );
    },
);

RekapTableBody.displayName = "RekapTableBody";

export default RekapTableBody;
