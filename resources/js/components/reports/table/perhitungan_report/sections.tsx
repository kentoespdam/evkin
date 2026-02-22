import { memo, useMemo } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GroupedPerhitunganData } from "@/hooks/use-perhitungan-report";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import PerhitunganReportTableBody from "./table_body";
import PerhitunganReportTableHeader from "./table_header";
import PerhitunganReportTotalNilai from "./total_nilai_section";

interface PerhitunganSectionsProps {
    groupedData: GroupedPerhitunganData;
    reportsByKey: Map<string, PerhitunganReportDetail>;
    year: number;
    months: { value: number; label: string }[];
    templateName: string;
    lastMonth: number;
}
const PerhitunganSections = memo(
    ({ groupedData, reportsByKey, year, months, templateName, lastMonth }: PerhitunganSectionsProps) => {
        const colspan = useMemo(
            () => (templateName === "TEMPLATE_KEPMENDAGRI" ? 6 + months.length * 2 + 2 * 2 : 6 + months.length * 3 + 2 * 3),
            [templateName, months.length],
        );
        return (
            <>
                <PerhitunganReportTableHeader year={year} months={months} templateName={templateName} lastMonth={lastMonth} />

                <TableHeader>
                    <TableRow>
                        <TableHead colSpan={colspan} className="border bg-amber-100">
                            {groupedData.aspect.name}
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <PerhitunganReportTableBody
                    masterReports={groupedData.masterReports}
                    reportsByKey={reportsByKey}
                    year={year}
                    months={months}
                    templateName={templateName}
                    lastMonth={lastMonth}
                />

                <PerhitunganReportTotalNilai
                    aspect={groupedData.aspect}
                    totalNilaiByMonthAndYear={groupedData.totalNilaiByMonthAndYear}
                    totalKinerjaByMonthAndYear={groupedData.totalKinerjaByMonthAndYear}
                    totalNilaiArchivement={groupedData.totalNilaiArchivement}
                    totalKinerjaArchivement={groupedData.totalKinerjaArchivement}
                    year={year}
                    months={months}
                    templateName={templateName}
                />
            </>
        );
    },
);
PerhitunganSections.displayName = "PerhitunganSections";

export default PerhitunganSections;
