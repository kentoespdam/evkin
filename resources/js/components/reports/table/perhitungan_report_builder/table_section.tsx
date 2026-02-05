import { memo, useMemo } from "react";
import SectionHeaderRekapBuilder from "@/components/rekap/section-header";
import type { GroupedDataKepmendagri } from "@/hooks/use-perhitungan-report";
import type { MonthOption } from "@/lib/utils";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import { RekapTableBody } from "./table_body";
import AspectFooter from "./table_footer_aspect";
import RekapTableHeader from "./table_header";

export interface TableSectionProps {
	groupedData: GroupedDataKepmendagri;
	months: MonthOption[];
	year: number;
	reportsByKey: Map<string, PerhitunganReportDetail>;
	templateName: string;
	showUnitColumn?: boolean;
	showFormulaColumn?: boolean;
}

const TableSection = memo(
	({
		groupedData,
		months,
		year,
		reportsByKey,
		templateName,
		showUnitColumn = true,
		showFormulaColumn = true,
	}: TableSectionProps) => {
		const colSpan = months.length * 2 + 5 + (showUnitColumn ? 1 : 0) + (showFormulaColumn ? 1 : 0);
		const aspectName = useMemo(() => {
			const names = groupedData.aspectName.split(".");
			return names.length > 1 ? names[1].trim().toUpperCase() : groupedData.aspectName;
		}, [groupedData.aspectName]);

		return (
			<>
				<RekapTableHeader
					year={year}
					months={months}
					showUnitColumn={showUnitColumn}
					showFormulaColumn={showFormulaColumn}
					templateName={templateName}
				/>

				<SectionHeaderRekapBuilder title={groupedData.aspectName} colSpan={colSpan} />

				<RekapTableBody
					masterReports={groupedData.masterReports}
					tahunLaluMap={groupedData.tahunLaluMap}
					reportsByKey={reportsByKey}
					year={year}
					months={months}
					showUnitColumn={showUnitColumn}
					showFormulaColumn={showFormulaColumn}
					templateName={templateName}
				/>

				<AspectFooter
					label={`NILAI KINERJA ${aspectName}`}
					monthlyTotals={groupedData.monthlyTotals}
					totalTahunLalu={groupedData.totalTahunLalu}
					nilaiKinerjaTahunLalu={groupedData.nilaiKinerjaTahunLalu}
					nilaiBobotTahunLalu={groupedData.nilaiBobotTahunLalu}
					months={months}
					showUnitColumn={showUnitColumn}
					showFormulaColumn={showFormulaColumn}
					templateName={templateName}
				/>
			</>
		);
	},
);

TableSection.displayName = "TableSection";

export default TableSection;
