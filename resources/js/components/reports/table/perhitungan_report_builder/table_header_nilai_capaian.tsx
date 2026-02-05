import { memo } from "react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface NilaiPencapaianHeaderCellProps {
	templateName: string;
	className?: string;
	labelPencapaian?: string;
	labelIndikator?: string;
}

const NilaiPencapaianHeaderCellBuilder = memo(
	({
		templateName: jenisReport,
		className = "",
		labelPencapaian = "Nilai Pencapaian",
		labelIndikator = "Nilai Indikator",
	}: NilaiPencapaianHeaderCellProps) => {
		const baseClasses = "text-center border whitespace-pre-wrap text-sm";

		return (
			<>
				<TableHead className={cn(baseClasses, className)}>{labelPencapaian}</TableHead>
				<TableHead className={cn(baseClasses, className)}>{labelIndikator}</TableHead>
				{jenisReport === "TEMPLATE_PUPR" && <TableHead className={cn(baseClasses, className)}>Hasil</TableHead>}
			</>
		);
	},
);

NilaiPencapaianHeaderCellBuilder.displayName = "NilaiPencapaianHeaderCellBuilder";

export default NilaiPencapaianHeaderCellBuilder;
