import { memo } from "react";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import NilaiCells from "./nilai_cells";

interface NilaiByMonthProps {
    report: Report;
    year: number;
    months: { value: number; label: string }[];
    reportsByKey: Map<string, PerhitunganReportDetail>;
    templateName: string;
}
const NilaiByMonth = memo(({ report, year, months, reportsByKey, templateName }: NilaiByMonthProps) =>
    months.map((month) => {
        const key = `${report.id}-${year}-${month.value}`;
        const reportDetail = reportsByKey?.get(key);
        const nilai = reportDetail?.nilai;
        const nilaiIndicator = reportDetail?.nilaiIndicator;
        const nilaiBobot = reportDetail?.nilaiBobot;
        return (
            <NilaiCells
                key={month.value}
                nilai={nilai}
                nilaiIndicator={nilaiIndicator}
                nilaiBobot={nilaiBobot}
                templateName={templateName}
            />
        );
    }),
);
NilaiByMonth.displayName = "NilaiByMonth";

export default NilaiByMonth;
