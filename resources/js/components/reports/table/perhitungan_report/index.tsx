import { useMemo } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { usePerhitunganData } from "@/hooks/use-perhitungan-report";
import { monthsList } from "@/lib/utils";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import type { ReportType } from "@/types/report-type";
import PerhitunganSections from "./sections";
import TotalSection from "./total_section";



interface PerhitunganReportsProps {
    masterReports: Report[];
    aspects: Aspect[];
    reports: PerhitunganReportDetail[];
    year: number;
    reportTypes: ReportType;
}
const PerhitunganReports = ({ masterReports, reportTypes, aspects, reports, year }: PerhitunganReportsProps) => {
    const {
        lastMonth,
        groupedData,
        reportsByKey,
        nilaiKinerjaTotalByMonthAndYear,
        nilaiKinerjaTotalArchivement,
        performanceByMonthAndYear,
        performanceArchivement
    } = usePerhitunganData(masterReports, aspects, reports, year, reportTypes);
    const months = useMemo(() => monthsList(), []);

    return (
        <div className="grid gap-6 overflow-x-auto">
            <Table className="w-full">
                {groupedData.map((group) => (
                    <PerhitunganSections
                        key={group.aspect.id}
                        groupedData={group}
                        year={year}
                        months={months}
                        templateName={reportTypes.templateName ?? "TEMPLATE_KEPMENDAGRI"}
                        reportsByKey={reportsByKey}
                        lastMonth={lastMonth}
                    />
                ))}

                <TableBody>
                    <TableRow><TableCell className="h-8" /></TableRow>
                </TableBody>

                <TotalSection
                    nilaiKinerjaTotalByMonthAndYear={nilaiKinerjaTotalByMonthAndYear}
                    nilaiKinerjaTotalArchivement={nilaiKinerjaTotalArchivement}
                    performanceByMonthAndYear={performanceByMonthAndYear}
                    performanceArchivement={performanceArchivement}
                    months={months}
                    year={year}
                    templateName={reportTypes.templateName ?? "TEMPLATE_KEPMENDAGRI"}
                />
            </Table>
        </div>
    );
};

export default PerhitunganReports;
