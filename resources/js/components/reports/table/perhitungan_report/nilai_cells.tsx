import { memo } from "react";
import { TableCell } from "@/components/ui/table";

interface NilaiCellsProps {
	templateName: string;
	nilai?: number;
	nilaiIndicator?: number;
	nilaiBobot?: number;
	title?: string;
}
const NilaiCells = memo(({ nilai, nilaiIndicator, nilaiBobot, templateName, title }: NilaiCellsProps) => {
	return (
		<>
			<TableCell className="border text-center" title={title}>
				{nilai ? nilai : "-"}
			</TableCell>
			<TableCell className="border text-center" title={title}>
				{nilaiIndicator ? nilaiIndicator : "-"}
			</TableCell>
			{templateName === "TEMPLATE_PUPR" ? (
				<TableCell className="border text-center" title={title}>
					{nilaiBobot ? nilaiBobot : "-"}
				</TableCell>
			) : null}
		</>
	);
});
NilaiCells.displayName = "NilaiCells";

export default NilaiCells;
