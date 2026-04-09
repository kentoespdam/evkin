import { memo } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { MonthOption } from "@/lib/utils";
import type { Aspect } from "@/types/aspect";
import TotalNilaiCells from "./total_nilai_cells";

interface PerhitunganReportTotalNilaiProps {
	aspect: Aspect;
	totalNilaiByMonthAndYear: Map<string, number>;
	totalKinerjaByMonthAndYear: Map<string, number>;
	totalNilaiArchivement: number;
	totalKinerjaArchivement: number;
	year: number;
	months: MonthOption[];
	templateName: string;
}
const PerhitunganReportTotalNilai = memo(
	({
		aspect,
		totalNilaiByMonthAndYear,
		totalKinerjaByMonthAndYear,
		totalNilaiArchivement,
		totalKinerjaArchivement,
		year,
		months,
		templateName,
	}: PerhitunganReportTotalNilaiProps) => {
		// BUG-03: Safe parsing dengan optional chaining dan fallback
		const aspectName = aspect.name.split(".")[1]?.trim().toUpperCase() ?? aspect.name.trim().toUpperCase();
		const SEP = "|";
		const keyLastYear = `${aspect.id}${SEP}${year - 1}${SEP}12`;
		const totalNilaiLastYear = totalNilaiByMonthAndYear.get(keyLastYear);
		const totalKinerjaLastYear = totalKinerjaByMonthAndYear.get(keyLastYear);
		return (
			<TableBody>
				<TableRow>
					<TableCell colSpan={5} className="border bg-amber-100 font-bold pl-10">
						Jumlah Nilai yang Diperoleh
					</TableCell>
					{months.map((month) => {
						const key = `${aspect.id}${SEP}${year}${SEP}${month.value}`;
						const totalNilai = totalNilaiByMonthAndYear.get(key);
						return <TotalNilaiCells key={month.value} totalNilai={totalNilai} templateName={templateName} />;
					})}
					<TotalNilaiCells totalNilai={totalNilaiArchivement} templateName={templateName} />
					<TotalNilaiCells
						totalNilai={totalNilaiLastYear}
						templateName={templateName}
						title={totalNilaiLastYear === undefined ? "Data Desember tahun lalu belum tersedia" : undefined}
					/>
				</TableRow>
				{templateName === "TEMPLATE_KEPMENDAGRI" ? (
					<TableRow>
						<TableCell colSpan={2} className="border bg-amber-100 font-bold pl-10">
							Total Kinerja {aspectName}
						</TableCell>
						<TableCell colSpan={3} className="border bg-amber-100 font-bold text-center">
							(Jumlah Perolehan Nilai : Nilai Maksimal) x Bobot
						</TableCell>
						{months.map((month) => {
							const key = `${aspect.id}${SEP}${year}${SEP}${month.value}`;
							const totalKinerja = totalKinerjaByMonthAndYear.get(key);
							return <TotalNilaiCells key={month.value} totalNilai={totalKinerja} templateName={templateName} />;
						})}
						<TotalNilaiCells totalNilai={totalKinerjaArchivement} templateName={templateName} />
						<TotalNilaiCells
							totalNilai={totalKinerjaLastYear}
							templateName={templateName}
							title={totalKinerjaLastYear === undefined ? "Data Desember tahun lalu belum tersedia" : undefined}
						/>
					</TableRow>
				) : null}

				<TableRow>
					<TableCell className="h-8" />
				</TableRow>
			</TableBody>
		);
	},
);
PerhitunganReportTotalNilai.displayName = "PerhitunganReportTotalNilai";

export default PerhitunganReportTotalNilai;
