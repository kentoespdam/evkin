import { TableBody, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import BasicInfoCells from "./basic_info_cells";
import NilaiArchivement from "./nilai_archivement_cells";
import NilaiByMonth from "./nilai_by_month_cells";
import NilaiTahunLalu from "./nilai_tahun_lalu_cells";

interface PerhitunganReportTableBodyProps {
    masterReports: Report[];
    reportsByKey: Map<string, PerhitunganReportDetail>;
    year: number;
    months: { value: number; label: string }[];
    templateName: string;
    lastMonth: number;
}

const PerhitunganReportTableBody = ({
    masterReports,
    reportsByKey,
    year,
    months,
    templateName,
    lastMonth,
}: PerhitunganReportTableBodyProps) => {
    return (
        <TableBody>
            {masterReports.map((report) => {
                return (
                    <TableRow key={report.id} className={cn("odd:bg-muted")}>
                        <BasicInfoCells report={report} />
                        <NilaiByMonth
                            report={report}
                            year={year}
                            months={months}
                            reportsByKey={reportsByKey}
                            templateName={templateName}
                        />
                        <NilaiArchivement
                            report={report}
                            year={year}
                            lastMonth={lastMonth}
                            reportsByKey={reportsByKey}
                            templateName={templateName}
                        />
                        <NilaiTahunLalu masterReportId={report.id} year={year} reportsByKey={reportsByKey} templateName={templateName} />
                    </TableRow>
                );
            })}
        </TableBody>
    );
};

export default PerhitunganReportTableBody;
