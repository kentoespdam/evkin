import { memo } from "react";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import NilaiCells from "./nilai_cells";

interface NilaiTahunLaluProps {
    masterReportId: string;
    year: number;
    reportsByKey: Map<string, PerhitunganReportDetail>;
    templateName: string
}
const NilaiTahunLalu = memo(({ masterReportId, year, reportsByKey, templateName }: NilaiTahunLaluProps) => {
    const key = `${masterReportId}-${year - 1}-12`;
    const reportDetail = reportsByKey?.get(key);
    const nilai = reportDetail?.nilai;
    const nilaiIndicator = reportDetail?.nilaiIndicator;
    const nilaiBobot = reportDetail?.nilaiBobot;
    return (
        <NilaiCells
            nilai={nilai}
            nilaiIndicator={nilaiIndicator}
            nilaiBobot={nilaiBobot}
            templateName={templateName}
        />
    );
});
NilaiTahunLalu.displayName = "NilaiTahunLalu";

export default NilaiTahunLalu;
