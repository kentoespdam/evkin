import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { usePerhitunganData } from "@/hooks/use-perhitungan-report";
import { MONTHS, type MonthOption } from "@/lib/utils";
import type { Aspect } from "@/types/aspect";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import type { ReportType } from "@/types/report-type";
import PerhitunganSections from "./sections";
import PerhitunganReportTableHeader from "./table_header";
import TotalSection from "./total_section";

interface PerhitunganReportsProps {
	masterReports: Report[];
	aspects: Aspect[];
	reports: PerhitunganReportDetail[];
	year: number;
	reportTypes: ReportType;
}

/**
 * PerhitunganReports Component
 *
 * NOTE ON PERFORMANCE (OPT-04):
 * This component relies on referential equality of props for memoization efficiency.
 * When passing `masterReports`, `aspects`, and `reports`, ensure they have stable
 * references to prevent unnecessary recalculations in `usePerhitunganData`.
 *
 * Best practices for parent components:
 * 1. Use `useMemo` to stabilize array props: `useMemo(() => [...], [])`
 * 2. Use state management solutions that provide stable references (e.g., React Query)
 * 3. Avoid creating new arrays inline in JSX: `reports={data?.reports ?? []}`
 *
 * Without stable references, the heavy computation in `usePerhitunganData` will
 * re-run on every parent re-render, even if the actual data hasn't changed.
 */
const PerhitunganReports = ({ masterReports, reportTypes, aspects, reports, year }: PerhitunganReportsProps) => {
	const {
		lastMonth,
		groupedData,
		reportsByKey,
		nilaiKinerjaTotalByMonthAndYear,
		nilaiKinerjaTotalArchivement,
		performanceByMonthAndYear,
		performanceArchivement,
	} = usePerhitunganData(masterReports, aspects, reports, year, reportTypes);
	const months: MonthOption[] = MONTHS;
	const templateName = reportTypes.templateName ?? "TEMPLATE_KEPMENDAGRI";

	return (
		<div className="grid gap-6 overflow-x-auto">
			{groupedData.map((group) => (
				<Table key={group.aspect.id} className="w-full">
					<PerhitunganReportTableHeader
						year={year}
						months={months}
						templateName={templateName}
						lastMonth={lastMonth}
					/>

					<PerhitunganSections
						groupedData={group}
						year={year}
						months={months}
						templateName={templateName}
						reportsByKey={reportsByKey}
						lastMonth={lastMonth}
					/>
				</Table>
			))}

			<Table className="w-full">
				<TotalSection
					nilaiKinerjaTotalByMonthAndYear={nilaiKinerjaTotalByMonthAndYear}
					nilaiKinerjaTotalArchivement={nilaiKinerjaTotalArchivement}
					performanceByMonthAndYear={performanceByMonthAndYear}
					performanceArchivement={performanceArchivement}
					months={months}
					year={year}
					templateName={templateName}
				/>
			</Table>
		</div>
	);
};

export default PerhitunganReports;
