import { useMemo } from "react";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";

export interface GroupedDataKepmendagri {
	aspectId: string;
	aspectName: string;
	maxScore: number;
	weight: number;
	masterReports: Report[];
	tahunLaluMap: Map<string, PerhitunganReportDetail>;
	monthlyTotals: Map<
		number,
		{
			totalNilaiIndicator: number;
			totalBobot: number;
			nilaiKinerja: number;
		}
	>;
	totalTahunLalu: number;
	nilaiKinerjaTahunLalu: number;
	nilaiBobotTahunLalu: number;
}

export const usePerhitunganDataKepmendagri = (
	masterReports: Report[],
	aspects: Aspect[],
	reports: PerhitunganReportDetail[],
	year: number,
) => {
	return useMemo(() => {
		// 1. Index masterReports by aspectId
		const masterReportsByAspect = new Map<string, Report[]>();
		const uniqueReportIds = new Set<string>();

		// Pre-index master reports
		masterReports.forEach((report) => {
			if (!uniqueReportIds.has(report.id)) {
				uniqueReportIds.add(report.id);
				const aspectReports = masterReportsByAspect.get(report.aspect.id) || [];
				aspectReports.push(report);
				masterReportsByAspect.set(report.aspect.id, aspectReports);
			}
		});

		// 2. Index reports
		const reportsByKey = new Map<string, PerhitunganReportDetail>();
		const tahunLaluByAspect = new Map<string, Map<string, PerhitunganReportDetail>>();
		const totalKinerjaByMonth = new Map<string, number>();
		const totalBobotByMonth = new Map<string, number>();

		reports.forEach((report) => {
			const key = `${report.masterReport.id}-${report.year}-${report.month}`;

			if (report.year === year) {
				reportsByKey.set(key, report);

				const monthKey = `${report.year}-${report.month}`;
				totalKinerjaByMonth.set(monthKey, (totalKinerjaByMonth.get(monthKey) || 0) + (report.nilaiIndicator || 0));
				totalBobotByMonth.set(monthKey, (totalBobotByMonth.get(monthKey) || 0) + Number(report.nilaiBobot ?? 0));
			} else if (report.year === year - 1 && report.month === 12) {
				const aspectId = report.masterReport.aspect.id;
				if (!tahunLaluByAspect.has(aspectId)) {
					tahunLaluByAspect.set(aspectId, new Map());
				}
				tahunLaluByAspect.get(aspectId)?.set(report.masterReport.id, report);

				const lastYearKey = `${report.year}-${report.month}`;
				totalKinerjaByMonth.set(
					lastYearKey,
					(totalKinerjaByMonth.get(lastYearKey) || 0) + (report.nilaiIndicator || 0),
				);
				totalBobotByMonth.set(lastYearKey, (totalBobotByMonth.get(lastYearKey) || 0) + Number(report.nilaiBobot ?? 0));
			}
		});

		// 3. Build grouped data
		const groupedData = aspects
			.map((aspect) => {
				const masterReportsList = masterReportsByAspect.get(aspect.id) || [];
				if (masterReportsList.length === 0) return null;

				const aspectTahunLaluMap = tahunLaluByAspect.get(aspect.id) || new Map();

				const monthlyTotals = new Map<
					number,
					{
						totalNilaiIndicator: number;
						totalBobot: number;
						nilaiKinerja: number;
					}
				>();

				const months = Array.from({ length: 12 }, (_, i) => i + 1);

				months.forEach((month) => {
					let totalNilaiIndicator = 0;
					let totalBobot = 0;

					masterReportsList.forEach((mr) => {
						const key = `${mr.id}-${year}-${month}`;
						const detail = reportsByKey.get(key);
						totalNilaiIndicator += detail?.nilaiIndicator || 0;
						totalBobot += Number(detail?.nilaiBobot ?? 0);
					});

					const nilaiKinerja =
						aspect.maxScore && aspect.maxScore > 0 ? (totalNilaiIndicator / aspect.maxScore) * (aspect.weight || 1) : 0;
					monthlyTotals.set(month, {
						totalNilaiIndicator,
						totalBobot,
						nilaiKinerja,
					});
				});

				const totalTahunLalu = Array.from(aspectTahunLaluMap.values()).reduce(
					(sum, detail) => sum + (detail.nilaiIndicator || 0),
					0,
				);

				const nilaiBobotTahunLalu = Array.from(aspectTahunLaluMap.values()).reduce(
					(sum, detail) => sum + Number(detail.nilaiBobot ?? 0),
					0,
				);

				const nilaiKinerjaTahunLalu =
					aspect.maxScore && aspect.maxScore > 0 ? (totalTahunLalu / aspect.maxScore) * (aspect.weight || 1) : 0;
				// const nilaiBobotTahunLalu=
				return {
					aspectId: aspect.id,
					aspectName: aspect.name,
					maxScore: aspect.maxScore || 0,
					weight: aspect.weight || 0,
					masterReports: masterReportsList,
					tahunLaluMap: aspectTahunLaluMap,
					monthlyTotals,
					totalTahunLalu,
					nilaiKinerjaTahunLalu,
					nilaiBobotTahunLalu,
				};
			})
			.filter(Boolean) as GroupedDataKepmendagri[];

		return {
			groupedData,
			reportsByKey,
			totalKinerjaByMonth,
			totalBobotByMonth,
		};
	}, [masterReports, aspects, reports, year]);
};

export interface GroupedDataPupr {
	aspectId: string;
	aspectName: string;
	maxScore: number;
	weight: number;
	masterReports: Report[];
	tahunLaluMap: Map<string, PerhitunganReportDetail>;
	monthlyTotals: Map<
		number,
		{
			totalNilaiIndicator: number;
			totalBobot: number;
			nilaiKinerja: number;
		}
	>;
	totalTahunLalu: number;
	nilaiKinerjaTahunLalu: number;
}

export const usePerhitunganDataPupr = (
	masterReports: Report[],
	aspects: Aspect[],
	reports: PerhitunganReportDetail[],
	year: number,
) => {
	return useMemo(() => {
		// 1. Index masterReports by aspectId
		const masterReportsByAspect = new Map<string, Report[]>();
		const uniqueReportIds = new Set<string>();

		// Pre-index master reports
		masterReports.forEach((report) => {
			if (!uniqueReportIds.has(report.id)) {
				uniqueReportIds.add(report.id);
				const aspectReports = masterReportsByAspect.get(report.aspect.id) || [];
				aspectReports.push(report);
				masterReportsByAspect.set(report.aspect.id, aspectReports);
			}
		});

		// 2. Index reports
		const reportsByKey = new Map<string, PerhitunganReportDetail>();
		const tahunLaluByAspect = new Map<string, Map<string, PerhitunganReportDetail>>();
		const totalKinerjaByMonth = new Map<string, number>();

		reports.forEach((report) => {
			const key = `${report.masterReport.id}-${report.year}-${report.month}`;

			if (report.year === year) {
				reportsByKey.set(key, report);

				const monthKey = `${report.year}-${report.month}`;
				totalKinerjaByMonth.set(monthKey, (totalKinerjaByMonth.get(monthKey) || 0) + (report.nilaiIndicator || 0));
			} else if (report.year === year - 1 && report.month === 12) {
				const aspectId = report.masterReport.aspect.id;
				if (!tahunLaluByAspect.has(aspectId)) {
					tahunLaluByAspect.set(aspectId, new Map());
				}
				tahunLaluByAspect.get(aspectId)?.set(report.masterReport.id, report);

				const lastYearKey = `${report.year}-${report.month}`;
				totalKinerjaByMonth.set(
					lastYearKey,
					(totalKinerjaByMonth.get(lastYearKey) || 0) + (report.nilaiIndicator || 0),
				);
			}
		});

		// 3. Build grouped data
		const groupedData = aspects
			.map((aspect) => {
				const masterReportsList = masterReportsByAspect.get(aspect.id) || [];
				if (masterReportsList.length === 0) return null;

				const aspectTahunLaluMap = tahunLaluByAspect.get(aspect.id) || new Map();

				const monthlyTotals = new Map<
					number,
					{
						totalNilaiIndicator: number;
						totalBobot: number;
						nilaiKinerja: number;
					}
				>();

				const months = Array.from({ length: 12 }, (_, i) => i + 1);

				months.forEach((month) => {
					let totalNilaiIndicator = 0;
					let totalBobot = 0;

					masterReportsList.forEach((mr) => {
						const key = `${mr.id}-${year}-${month}`;
						const detail = reportsByKey.get(key);
						totalNilaiIndicator += detail?.nilaiBobot || 0;
						totalBobot += detail?.nilaiBobot || 0;
					});

					const nilaiKinerja =
						aspect.maxScore && aspect.maxScore > 0 ? (totalNilaiIndicator / aspect.maxScore) * (aspect.weight || 1) : 0;
					monthlyTotals.set(month, {
						totalNilaiIndicator,
						totalBobot,
						nilaiKinerja,
					});
				});

				const totalTahunLalu = Array.from(aspectTahunLaluMap.values()).reduce(
					(sum, detail) => sum + (detail.nilaiIndicator || 0),
					0,
				);

				const nilaiKinerjaTahunLalu =
					aspect.maxScore && aspect.maxScore > 0 ? (totalTahunLalu / aspect.maxScore) * (aspect.weight || 1) : 0;
				return {
					aspectId: aspect.id,
					aspectName: aspect.name,
					maxScore: aspect.maxScore || 0,
					weight: aspect.weight || 0,
					masterReports: masterReportsList,
					tahunLaluMap: aspectTahunLaluMap,
					monthlyTotals,
					totalTahunLalu,
					nilaiKinerjaTahunLalu,
				};
			})
			.filter(Boolean) as GroupedDataPupr[];

		return {
			groupedData,
			reportsByKey,
			totalKinerjaByMonth,
		};
	}, [masterReports, aspects, reports, year]);
};
