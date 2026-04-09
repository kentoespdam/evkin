import { useMemo } from "react";
import { totalKinerjaToKinerja } from "@/lib/math_parser";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import type { ReportType } from "@/types/report-type";

/**
 * Data perhitungan yang telah dikelompokkan berdasarkan aspek
 * Grouped calculation data by aspect
 */
export interface GroupedPerhitunganData {
	/** Aspek yang terkait dengan data perhitungan */
	aspect: Aspect;
	/** Daftar master report yang termasuk dalam aspek ini */
	masterReports: Report[];
	/** Total nilai per bulan dan tahun dengan key: "aspectId-year-month" */
	totalNilaiByMonthAndYear: Map<string, number>;
	/** Total nilai kinerja per bulan dan tahun dengan key: "aspectId-year-month" */
	totalKinerjaByMonthAndYear: Map<string, number>;
	/** Total nilai capaian untuk bulan terakhir */
	totalNilaiArchivement: number;
	/** Total nilai kinerja capaian untuk bulan terakhir */
	totalKinerjaArchivement: number;
}

/**
 * Hook untuk memproses dan mengelompokkan data perhitungan report berdasarkan aspek
 * Calculates performance metrics by aspect, month, and year
 *
 * @param masterReports - Daftar master report yang akan diproses
 * @param aspects - Daftar aspek yang digunakan untuk pengelompokan
 * @param reports - Detail perhitungan report untuk setiap master report
 * @param year - Tahun yang sedang dihitung
 * @param jenisReport - Jenis report (menentukan template dan formula yang digunakan)
 *
 * @returns Object berisi:
 * - lastMonth: Bulan terakhir yang memiliki data
 * - groupedData: Data yang dikelompokkan per aspek
 * - reportsByKey: Map untuk akses cepat ke report detail (key: "masterReportId-year-month")
 * - nilaiKinerjaTotalByMonthAndYear: Total nilai kinerja per bulan (key: "year-month")
 * - nilaiKinerjaTotalArchivement: Total nilai kinerja capaian
 * - performanceByMonthAndYear: Penilaian kinerja per bulan (key: "year-month")
 * - performanceArchivement: Penilaian kinerja capaian
 */
export const usePerhitunganData = (
	masterReports: Report[],
	aspects: Aspect[],
	reports: PerhitunganReportDetail[],
	year: number,
	jenisReport: ReportType,
) => {
	return useMemo(() => {
		// Tentukan template dan formula yang digunakan berdasarkan jenis report
		// Determine template and formula based on report type
		const templateName = jenisReport.templateName ?? "TEMPLATE_KEPMENDAGRI";
		const formulaPerformance = jenisReport.formulaPerformance;
		const groupedMasterReportsByAspect = new Map<string, GroupedPerhitunganData>();

		// Cari bulan terakhir yang memiliki data pada tahun yang dipilih
		// Find the last month that has data for the selected year
		const lastMonth = reports.length > 0 ? Math.max(...reports.filter((r) => r.year === year).map((r) => r.month)) : 0;

		// OPT-01: Build index for O(1) lookup instead of O(n) nested loop
		// Group reports by masterReportId for fast access
		const reportsByMasterReportId = new Map<string, PerhitunganReportDetail[]>();
		reports.forEach((report) => {
			const mrId = report.masterReport.id;
			if (!reportsByMasterReportId.has(mrId)) {
				reportsByMasterReportId.set(mrId, []);
			}
			const mrReports = reportsByMasterReportId.get(mrId);
			if (mrReports) {
				mrReports.push(report);
			}
		});

		// Separator untuk key Map (menggunakan '|' untuk menghindari konflik dengan UUID yang mengandung '-')
		// Map key separator (using '|' to avoid conflicts with UUIDs containing '-')
		const SEP = "|";

		// Loop setiap aspek untuk menghitung total nilai dan kinerja
		// Loop through each aspect to calculate total values and performance
		aspects.forEach((aspect) => {
			const aspectKey = aspect.id;
			const maxScore = aspect.maxScore || 0;
			const weight = aspect.weight || 0;

			// Filter dan urutkan master reports berdasarkan aspek ini
			// Filter and sort master reports by this aspect
			const groupedMasterReports = masterReports
				.filter((mr) => mr.aspect.id === aspect.id)
				.sort((a, b) => a.seq - b.seq);

			// Hitung total nilai per bulan dan tahun untuk aspek ini
			// Calculate total value by month and year for this aspect
			const totalNilaiByMonthAndYear = new Map<string, number>();
			groupedMasterReports.forEach((mr) => {
				// OPT-01: Direct lookup instead of iterating all reports
				const mrReports = reportsByMasterReportId.get(mr.id) || [];
				mrReports.forEach((report) => {
					const key = `${aspectKey}${SEP}${report.year}${SEP}${report.month}`;
					// Gunakan nilaiIndicator untuk KEPMENDAGRI, nilaiBobot untuk template lain
					const nilai =
						templateName === "TEMPLATE_KEPMENDAGRI" ? Number(report.nilaiIndicator) : Number(report.nilaiBobot);
					totalNilaiByMonthAndYear.set(key, (totalNilaiByMonthAndYear.get(key) || 0) + nilai);
				});
			});

			// Konversi total nilai menjadi nilai kinerja (dengan bobot)
			// Convert total value to performance value (with weight)
			const totalKinerjaByMonthAndYear = new Map<string, number>();
			totalNilaiByMonthAndYear.forEach((totalNilai, key) => {
				const [_, yearStr, monthStr] = key.split(SEP);
				const month = parseInt(monthStr, 10);
				const year = parseInt(yearStr, 10);
				// Untuk KEPMENDAGRI: (nilai/maxScore) * bobot, untuk lainnya: nilai langsung
				const nilaiKinerja =
					templateName === "TEMPLATE_KEPMENDAGRI" ? (maxScore > 0 ? (totalNilai / maxScore) * weight : 0) : totalNilai;
				totalKinerjaByMonthAndYear.set(`${aspectKey}${SEP}${year}${SEP}${month}`, nilaiKinerja);
			});

			// Hitung total nilai capaian untuk bulan terakhir
			// Calculate total achievement value for the last month
			const totalNilaiArchivement = reports
				.filter(
					(report) => report.masterReport.aspect.id === aspect.id && report.year === year && report.month === lastMonth,
				)
				.reduce(
					(sum, report) =>
						sum +
						(templateName === "TEMPLATE_KEPMENDAGRI"
							? Number(report.nilaiIndicator)
							: Number(report.nilaiBobotArchivement)),
					0,
				);

			// Konversi nilai capaian menjadi kinerja capaian
			// Convert achievement value to achievement performance
			const totalKinerjaArchivement =
				templateName === "TEMPLATE_KEPMENDAGRI"
					? maxScore > 0
						? (totalNilaiArchivement / maxScore) * weight
						: 0
					: totalNilaiArchivement;

			groupedMasterReportsByAspect.set(aspectKey, {
				aspect: aspect,
				masterReports: groupedMasterReports,
				totalNilaiByMonthAndYear,
				totalKinerjaByMonthAndYear,
				totalNilaiArchivement,
				totalKinerjaArchivement,
			});
		});

		// Buat index/map untuk akses cepat ke report detail berdasarkan key
		// Create index/map for quick access to report details by key
		const reportsByKey = new Map<string, PerhitunganReportDetail>();
		reports.forEach((report) => {
			const key = `${report.masterReport.id}${SEP}${report.year}${SEP}${report.month}`;
			reportsByKey.set(key, report);
		});

		// Hitung total nilai kinerja keseluruhan (gabungan semua aspek)
		// Calculate total overall performance values (combined all aspects)
		const nilaiKinerjaTotalByMonthAndYear = new Map<string, number>();
		let nilaiKinerjaTotalArchivement = 0;

		// Agregasi nilai kinerja dari semua aspek
		// Aggregate performance values from all aspects
		groupedMasterReportsByAspect.forEach((data) => {
			data.totalKinerjaByMonthAndYear.forEach((nilaiKinerja, key) => {
				// Ubah key dari "aspectId|year|month" menjadi "year|month"
				const splitKey = key.split(SEP);
				const newKey = `${splitKey[1]}${SEP}${splitKey[2]}`;
				// Akumulasi nilai kinerja untuk bulan yang sama
				nilaiKinerjaTotalByMonthAndYear.set(
					newKey,
					(nilaiKinerjaTotalByMonthAndYear.get(newKey) || 0) + Number(nilaiKinerja),
				);
			});
			// Akumulasi total kinerja capaian dari semua aspek
			nilaiKinerjaTotalArchivement += data.totalKinerjaArchivement;
		});

		// BUG-02: Hitung predikat kinerja dari total kumulatif, bukan dari aspek individual
		// Calculate performance ratings from cumulative totals, not individual aspects
		const performanceByMonthAndYear = new Map<string, string>();
		nilaiKinerjaTotalByMonthAndYear.forEach((totalKinerja, key) => {
			const penilaian = totalKinerjaToKinerja(Number(totalKinerja), formulaPerformance);
			performanceByMonthAndYear.set(key, penilaian);
		});

		// Hitung predikat kinerja untuk capaian keseluruhan
		// Calculate performance rating for overall achievement
		const performanceArchivement = totalKinerjaToKinerja(nilaiKinerjaTotalArchivement, formulaPerformance);
		// Set performance rating untuk bulan terakhir (capaian)
		performanceByMonthAndYear.set(`${year}${SEP}${lastMonth}`, performanceArchivement);

		return {
			lastMonth,
			groupedData: Array.from(groupedMasterReportsByAspect.values()),
			reportsByKey,
			nilaiKinerjaTotalByMonthAndYear,
			nilaiKinerjaTotalArchivement,
			performanceByMonthAndYear,
			performanceArchivement,
		};
	}, [masterReports, aspects, reports, year, jenisReport]);
};
