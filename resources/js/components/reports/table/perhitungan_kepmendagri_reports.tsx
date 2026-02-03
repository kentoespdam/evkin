import { Fragment, memo, useMemo } from "react";
import SectionHeaderRekapBuilder from "@/components/rekap/section-header";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatNumber, type MonthOption, monthsList, totalKinerjaToKinerja } from "@/lib/utils";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportDetail, PerhitunganReportProps } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";

// 1. TYPE UTILITIES
interface GroupedData {
	aspectId: string;
	aspectName: string;
	aspectFormula: string;
	masterReports: Report[];
	reportsMap: Map<string, PerhitunganReportDetail>;
	tahunLaluMap: Map<string, PerhitunganReportDetail>;
	monthlyTotals: Map<number, { totalNilaiIndicator: number; totalBobot: number }>;
	totalTahunLalu: number;
}

// 2. CONSTANTS
const YELLOW_ODD_CLASS = "bg-yellow-100";
const BORDER_CLASS = "border";
const TEXT_CENTER_CLASS = "text-center";
const WHITESPACE_PRE_WRAP = "whitespace-pre-wrap";
const TEXT_SM = "text-sm";
const PX_42 = "px-42";

// 3. HELPER FUNCTIONS
const generateReportKey = (reportId: string, year: number, month: number) => `${reportId}-${year}-${month}`;

const generateNilaiFormated = (value?: number) => {
	if (value === undefined || value === null || value === 0) return "-";
	return formatNumber(value, 2);
};

const getMonthCellClassName = (monthValue: number) =>
	cn(TEXT_CENTER_CLASS, BORDER_CLASS, monthValue % 2 === 1 ? YELLOW_ODD_CLASS : "");

// 4. PARSER untuk aspectFormula
const parseAspectFormula = (formula: string, totalNilaiIndicator: number): number => {
	if (!formula) return 0;

	const formulaParts = formula.split("*");
	const maxNilai = parseFloat(formulaParts[0].trim() ?? 0);
	const bobot = parseFloat(formulaParts[1].trim() ?? 0);

	if (maxNilai === 0) return 0;
	const result = (totalNilaiIndicator / maxNilai) * bobot;
	return parseFloat(result.toFixed(2));
};

// 5. DATA GROUPING HOOK - SEMUA PERHITUNGAN DISINI
const useGroupedData = (
	masterReports: Report[],
	aspects: Aspect[],
	reports: PerhitunganReportDetail[],
	year: number,
) => {
	return useMemo(() => {
		// Group masterReports by aspectId
		const masterReportsByAspect = new Map<string, Report[]>();
		const uniqueReportIds = new Set<string>();
		const uniqueTotalKinerjaIds = new Map<string, number>();

		masterReports.forEach((report) => {
			if (!uniqueReportIds.has(report.id)) {
				uniqueReportIds.add(report.id);
				const aspectReports = masterReportsByAspect.get(report.aspect.id) || [];
				aspectReports.push(report);
				masterReportsByAspect.set(report.aspect.id, aspectReports);
			}
		});

		// Create maps for report details
		const reportsMap = new Map<string, PerhitunganReportDetail>();
		const tahunLaluMapByAspect = new Map<string, Map<string, PerhitunganReportDetail>>();

		reports.forEach((report) => {
			const key = generateReportKey(report.masterReport.id, report.year, report.month);
			if (report.year === year) {
				reportsMap.set(key, report);
			} else if (report.year === year - 1 && report.month === 12) {
				const aspectId = report.masterReport.aspect.id;
				if (!tahunLaluMapByAspect.has(aspectId)) {
					tahunLaluMapByAspect.set(aspectId, new Map());
				}
				tahunLaluMapByAspect.get(aspectId)?.set(report.masterReport.id, report);
			}
		});

		reports.reduce((sum, report) => {
			const key = `${report.year}-${report.month}`;
			if (!uniqueTotalKinerjaIds.has(key)) {
				uniqueTotalKinerjaIds.set(key, 0);
			}
			uniqueTotalKinerjaIds.set(key, (uniqueTotalKinerjaIds.get(key) ?? 0) + (report.nilaiIndicator || 0));
			return sum;
		}, 0);

		// Build grouped data array dengan perhitungan footer
		const groupedData = aspects
			.map((aspect) => {
				const masterReportsList = masterReportsByAspect.get(aspect.id) || [];

				// Pre-calculate monthly totals untuk footer
				const monthlyTotals = new Map<number, { totalNilaiIndicator: number; totalBobot: number }>();
				const months = Array.from({ length: 12 }, (_, i) => i + 1);

				months.forEach((month) => {
					let totalNilaiIndicator = 0;
					let totalBobot = 0;

					masterReportsList.forEach((mr) => {
						const key = generateReportKey(mr.id, year, month);
						const detail = reportsMap.get(key);
						totalNilaiIndicator += detail?.nilaiIndicator || 0;
						totalBobot += mr.weight || 0;
					});

					monthlyTotals.set(month, { totalNilaiIndicator, totalBobot });
				});

				// Get tahunLaluMap for this aspect
				const aspectTahunLaluMap = tahunLaluMapByAspect.get(aspect.id) || new Map();

				// Pre-calculate total tahun lalu
				const totalTahunLalu = Array.from(aspectTahunLaluMap.values()).reduce(
					(sum, detail) => sum + (detail.nilaiIndicator || 0),
					0,
				);

				return {
					aspectId: aspect.id,
					aspectName: aspect.name,
					aspectFormula: aspect.formulaAspect || "",
					masterReports: masterReportsList,
					reportsMap,
					tahunLaluMap: aspectTahunLaluMap,
					monthlyTotals,
					totalTahunLalu,
				};
			})
			.filter((group) => group.masterReports.length > 0);
		return { groupedData: groupedData, totalKinerjaData: uniqueTotalKinerjaIds };
	}, [masterReports, aspects, reports, year]);
};

// 6. COMPONENTS
const NilaiPencapaianHeaderCellBuilder = memo(({ className = "" }: { className?: string }) => (
	<>
		<TableHead className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, WHITESPACE_PRE_WRAP, TEXT_SM, className)}>
			Nilai Pencapaian
		</TableHead>
		<TableHead className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, WHITESPACE_PRE_WRAP, TEXT_SM, className)}>
			Nilai Indikator
		</TableHead>
	</>
));
NilaiPencapaianHeaderCellBuilder.displayName = "NilaiPencapaianHeaderCellBuilder";

const PerhitunganReportsTableHeader = memo(({ year, months }: { year: number; months: MonthOption[] }) => (
	<TableHeader>
		<TableRow>
			<TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)} rowSpan={2}>
				NO
			</TableHead>
			<TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS, PX_42)} rowSpan={2}>
				INDIKATOR
			</TableHead>
			<TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS, PX_42)} rowSpan={2}>
				RUMUS
			</TableHead>
			<TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)} rowSpan={2}>
				BOBOT
			</TableHead>
			{months.map((month) => (
				<TableHead key={month.value} className={cn(getMonthCellClassName(month.value))} colSpan={2}>
					{month.label} {year}
				</TableHead>
			))}
			<TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS, YELLOW_ODD_CLASS)} colSpan={2}>
				Desember {year - 1}
			</TableHead>
		</TableRow>
		<TableRow>
			{months.map((month) => (
				<NilaiPencapaianHeaderCellBuilder
					key={`header-${month.value}`}
					className={month.value % 2 === 1 ? YELLOW_ODD_CLASS : ""}
				/>
			))}
			<NilaiPencapaianHeaderCellBuilder className={YELLOW_ODD_CLASS} />
		</TableRow>
	</TableHeader>
));
PerhitunganReportsTableHeader.displayName = "PerhitunganReportsTableHeader";

interface NilaiRowBuilderProps {
	monthValue: number;
	nilai?: number;
	nilaiIndicator?: number;
}

const NilaiRowBuilder = memo(({ monthValue, nilai, nilaiIndicator }: NilaiRowBuilderProps) => {
	const cellClassName = getMonthCellClassName(monthValue);

	return (
		<Fragment>
			<TableCell className={cellClassName}>{generateNilaiFormated(nilai)}</TableCell>
			<TableCell className={cellClassName}>{generateNilaiFormated(nilaiIndicator)}</TableCell>
		</Fragment>
	);
});
NilaiRowBuilder.displayName = "NilaiRowBuilder";

interface PerhitunganReportsTableBodyProps {
	groupedData: GroupedData;
	year: number;
	months: MonthOption[];
}

const PerhitunganReportsTableBody = memo(({ groupedData, year, months }: PerhitunganReportsTableBodyProps) => {
	const { masterReports, reportsMap, tahunLaluMap } = groupedData;

	return (
		<TableBody>
			{masterReports.map((mr, index) => {
				const detailTahunLalu = tahunLaluMap.get(mr.id);

				return (
					<TableRow key={mr.id} className="group hover:bg-muted/40">
						<TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{index + 1}</TableCell>
						<TableCell className={BORDER_CLASS}>{mr.descIndicator}</TableCell>
						<TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{mr.descFormula}</TableCell>
						<TableCell className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)}>{mr.weight}</TableCell>

						{months.map((month) => {
							const key = generateReportKey(mr.id, year, month.value);
							const detail = reportsMap.get(key);

							return (
								<NilaiRowBuilder
									key={`${mr.id}-${month.value}`}
									monthValue={month.value}
									nilai={detail?.nilai}
									nilaiIndicator={detail?.nilaiIndicator}
								/>
							);
						})}

						<TableCell className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, YELLOW_ODD_CLASS)}>
							{generateNilaiFormated(detailTahunLalu?.nilai)}
						</TableCell>
						<TableCell className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, YELLOW_ODD_CLASS)}>
							{generateNilaiFormated(detailTahunLalu?.nilaiIndicator)}
						</TableCell>
					</TableRow>
				);
			})}
		</TableBody>
	);
});
PerhitunganReportsTableBody.displayName = "PerhitunganReportsTableBody";

// 7. Footer Component yang dioptimasi
interface PerhitunganReportsTableFooterProps {
	groupedData: GroupedData;
	months: MonthOption[];
	tahunLalu?: Map<string, PerhitunganReportDetail>;
}

const PerhitunganReportsTableFooter = memo(({ groupedData, months, tahunLalu }: PerhitunganReportsTableFooterProps) => {
	const { monthlyTotals, totalTahunLalu, aspectFormula } = groupedData;

	return (
		<TableHeader>
			<TableRow>
				<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={4}>
					Jumlah Nilai Yang diperoleh
				</TableHead>
				{months.map((month) => {
					const total = monthlyTotals.get(month.value);
					return (
						<Fragment key={`total-${month.value}`}>
							<TableCell className={getMonthCellClassName(month.value)}>&nbsp;</TableCell>
							<TableCell className={getMonthCellClassName(month.value)}>
								{generateNilaiFormated(total?.totalNilaiIndicator)}
							</TableCell>
						</Fragment>
					);
				})}
				<TableCell className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, YELLOW_ODD_CLASS)}>&nbsp;</TableCell>
				<TableCell className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, YELLOW_ODD_CLASS)}>
					{generateNilaiFormated(totalTahunLalu)}
				</TableCell>
			</TableRow>
			<TableRow>
				<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={2}>
					NILAI KINERJA ASPEK KEUANGAN
				</TableHead>
				<TableHead className={cn(BORDER_CLASS)} colSpan={2}>
					(Jumlah Perolehan Nilai : Nilai Maksimal) x Bobot
				</TableHead>
				{months.map((month) => {
					const nilaiKinerja = aspectFormula
						? parseAspectFormula(aspectFormula, monthlyTotals.get(month.value)?.totalNilaiIndicator || 0)
						: 0;

					return (
						<Fragment key={`kinerja-${month.value}`}>
							<TableCell className={getMonthCellClassName(month.value)}></TableCell>
							<TableCell className={getMonthCellClassName(month.value)}>
								{generateNilaiFormated(nilaiKinerja)}
							</TableCell>
						</Fragment>
					);
				})}
				{/* Kolom untuk Desember tahun lalu - diisi kosong sesuai desain */}
				<TableCell className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, YELLOW_ODD_CLASS)} />
				<TableCell className={cn(TEXT_CENTER_CLASS, BORDER_CLASS, YELLOW_ODD_CLASS)}>
					{tahunLalu && aspectFormula
						? parseAspectFormula(
							aspectFormula,
							Array.from(tahunLalu.values()).reduce((sum, detail) => sum + (detail.nilaiIndicator || 0), 0),
						)
						: 0}
				</TableCell>
			</TableRow>
			<TableRow>
				<TableHead className={"h-8"} colSpan={2} />
			</TableRow>
		</TableHeader>
	);
});
PerhitunganReportsTableFooter.displayName = "PerhitunganReportsTableFooter";

// 8. MAIN COMPONENT
const PerhitunganReportsTable = ({
	masterReports,
	aspects,
	reports,
	filters,
	jenisReport,
}: Omit<PerhitunganReportProps, "reportTypes">) => {
	const months = useMemo(() => monthsList(), []);
	const { groupedData, totalKinerjaData } = useGroupedData(masterReports, aspects, reports, filters.year);

	if (groupedData.length === 0) {
		return <div className="text-center p-4">Tidak ada data yang tersedia</div>;
	}

	return (
		<div className="grid gap-6 overflow-x-auto">
			<Table className="w-full">
				{groupedData.map((group) => (
					<Fragment key={group.aspectId}>
						<PerhitunganReportsTableHeader year={filters.year} months={months} />
						<SectionHeaderRekapBuilder title={group.aspectName} colSpan={months.length * 2 + 6} />
						<PerhitunganReportsTableBody groupedData={group} year={filters.year} months={months} />
						<PerhitunganReportsTableFooter groupedData={group} months={months} tahunLalu={group.tahunLaluMap} />
					</Fragment>
				))}
				<TableFooter>
					<TableRow>
						<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={4}>
							NILAI KINERJA TOTAL
						</TableHead>
						{months.map((month) => {
							const totalId = `${filters.year}-${month.value}`;
							const totalKinerja = totalKinerjaData.get(totalId) || 0;
							return (
								<Fragment key={`total-kinerja-${month.value}`}>
									<TableHead className={cn(BORDER_CLASS)} />
									<TableHead className={cn(TEXT_CENTER_CLASS, BORDER_CLASS)}>{formatNumber(totalKinerja, 2)}</TableHead>
								</Fragment>
							);
						})}
						<TableHead className={cn(BORDER_CLASS)} />
						<TableHead className={cn(TEXT_CENTER_CLASS, BORDER_CLASS)}>
							{formatNumber(
								totalKinerjaData.get(`${filters.year - 1}-12`) || 0,
								2,
							)}
						</TableHead>
					</TableRow>
					<TableRow>
						<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={4}>
							KINERJA
						</TableHead>
						{months.map((month) => {
							const totalId = `${filters.year}-${month.value}`;
							const totalKinerja = totalKinerjaData.get(totalId) || 0;
							return (
								<TableHead
									key={`kinerja-text-${month.value}`}
									className={cn(TEXT_CENTER_CLASS, BORDER_CLASS)}
									colSpan={2}
								>
									{totalKinerjaToKinerja(jenisReport?.formulaPerformance || "", totalKinerja)}
								</TableHead>
							);
						})}
						<TableHead className={cn(TEXT_CENTER_CLASS, BORDER_CLASS)} colSpan={2}>
							{totalKinerjaToKinerja(
								jenisReport?.formulaPerformance || "",
								totalKinerjaData.get(`${filters.year - 1}-12`) || 0,
							)}
						</TableHead>
					</TableRow>
				</TableFooter>
			</Table>

		</div>
	);
};

export default memo(PerhitunganReportsTable);
