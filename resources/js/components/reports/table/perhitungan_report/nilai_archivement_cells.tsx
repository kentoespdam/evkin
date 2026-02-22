import { memo } from "react";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import NilaiCells from "./nilai_cells";

interface NilaiArchivementProps {
    report: Report;
    year: number;
    reportsByKey: Map<string, PerhitunganReportDetail>;
    templateName: string;
    lastMonth: number;
}
const NilaiArchivement = memo(({ report, year, lastMonth, reportsByKey, templateName }: NilaiArchivementProps) => {
    const key = `${report.id}-${year}-${lastMonth}`;
    const reportDetail = reportsByKey?.get(key);
    const nilai = reportDetail?.nilaiArchivement;
    const nilaiIndicator = reportDetail?.nilaiArchivementIndicator;
    const nilaiBobot = reportDetail?.nilaiBobotArchivement;
    return (
        <NilaiCells nilai={nilai} nilaiIndicator={nilaiIndicator} nilaiBobot={nilaiBobot} templateName={templateName} />
    );
});
NilaiArchivement.displayName = "NilaiArchivement";

export default NilaiArchivement;
