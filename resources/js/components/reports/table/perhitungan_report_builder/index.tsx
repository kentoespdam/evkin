import { memo, useMemo } from "react";
import { Table } from "@/components/ui/table";
import { usePerhitunganDataKepmendagri } from "@/hooks/use-perhitungan-report";
import { monthsList } from "@/lib/utils";
import type { PerhitunganReportProps } from "@/types/perhitungan-reports";
import TotalFooter from "./table_footer_total";
import TableSection from "./table_section";

const TemplateBuilder = ({
	masterReports,
	reportTypes,
	aspects,
	templateName,
	reports,
	filters,
}: PerhitunganReportProps) => {
	const jenisReport = useMemo(() => reportTypes.find((rt) => rt.id === filters.report_type_id), [filters, reportTypes]);

	const months = useMemo(() => monthsList(), []);
	const { groupedData, reportsByKey, totalKinerjaByMonth, totalBobotByMonth } = usePerhitunganDataKepmendagri(
		masterReports,
		aspects,
		reports,
		filters.year,
	);

	if (groupedData.length === 0) {
		return <div className="text-center p-4">Tidak ada data yang tersedia</div>;
	}

	return (
		<div className="grid gap-6 overflow-x-auto">
			<Table className="w-full">
				{groupedData.map((group) => (
					<TableSection
						key={group.aspectId}
						groupedData={group}
						months={months}
						year={filters.year}
						reportsByKey={reportsByKey}
						templateName={templateName}
					/>
				))}

				<TotalFooter
					months={months}
					year={filters.year}
					totalKinerjaByMonth={totalKinerjaByMonth}
					totalBobotByMonth={totalBobotByMonth}
					formulaPerformance={jenisReport?.formulaPerformance}
					templateName={templateName}
				/>
			</Table>
		</div>
	);
};

export default memo(TemplateBuilder);
