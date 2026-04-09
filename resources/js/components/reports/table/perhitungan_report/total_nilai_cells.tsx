import { memo } from "react";
import { TableCell } from "@/components/ui/table";
import { formatNumber } from "@/lib/math_parser";

interface TotalNilaiCellsProps {
	templateName: string;
	totalNilai?: number;
	title?: string;
}
const TotalNilaiCells = memo(({ templateName, totalNilai, title }: TotalNilaiCellsProps) => {
	return (
		<>
			{templateName === "TEMPLATE_PUPR" ? (
				<TableCell className="bg-amber-100 border font-bold text-center" title={title} />
			) : null}
			<TableCell className="bg-amber-100 border font-bold text-center" title={title} />
			<TableCell className="bg-amber-100 border font-bold text-center" title={title}>
				{totalNilai !== undefined ? formatNumber(totalNilai, 2) : "-"}
			</TableCell>
		</>
	);
});
TotalNilaiCells.displayName = "TotalNilaiCells";

export default TotalNilaiCells;
