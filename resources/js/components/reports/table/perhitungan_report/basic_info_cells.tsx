import { memo } from "react";
import { TableCell } from "@/components/ui/table";
import type { Report } from "@/types/report";

interface BasicInfoCellsProps {
	report: Report;
}
const BasicInfoCells = memo(({ report }: BasicInfoCellsProps) => {
	return (
		<>
			<TableCell className="border">{report.urut}</TableCell>
			<TableCell className="border">{report.descIndicator}</TableCell>
			<TableCell className="border">{report.descFormula}</TableCell>
			<TableCell className="border">{report.unit}</TableCell>
			<TableCell className="border">{report.weight}</TableCell>
		</>
	);
});
BasicInfoCells.displayName = "BasicInfo";

export default BasicInfoCells;
