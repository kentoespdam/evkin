import { memo } from "react";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import NilaiCells from "./nilai_cells";

interface NilaiTahunLaluProps {
	masterReportId: string;
	year: number;
	reportsByKey: Map<string, PerhitunganReportDetail>;
	templateName: string;
}
const NilaiTahunLalu = memo(({ masterReportId, year, reportsByKey, templateName }: NilaiTahunLaluProps) => {
	const SEP = "|";
	const key = `${masterReportId}${SEP}${year - 1}${SEP}12`;
	const reportDetail = reportsByKey?.get(key);
	const nilai = reportDetail?.nilai;
	const nilaiIndicator = reportDetail?.nilaiIndicator;
	const nilaiBobot = reportDetail?.nilaiBobot;
	const hasData = reportDetail !== undefined;
	return (
		<NilaiCells
			nilai={nilai}
			nilaiIndicator={nilaiIndicator}
			nilaiBobot={nilaiBobot}
			templateName={templateName}
			title={!hasData ? "Data Desember tahun lalu belum tersedia" : undefined}
		/>
	);
});
NilaiTahunLalu.displayName = "NilaiTahunLalu";

export default NilaiTahunLalu;
