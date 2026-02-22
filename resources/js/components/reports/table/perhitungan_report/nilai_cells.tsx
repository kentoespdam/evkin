import { memo } from "react";
import { TableCell } from "@/components/ui/table";

interface NilaiCellsProps {
    templateName: string;
    nilai?: number;
    nilaiIndicator?: number;
    nilaiBobot?: number;
}
const NilaiCells = memo(({ nilai, nilaiIndicator, nilaiBobot, templateName }: NilaiCellsProps) => {
    return (
        <>
            <TableCell className="border text-center">{nilai ? nilai : "-"}</TableCell>
            <TableCell className="border text-center">{nilaiIndicator ? nilaiIndicator : "-"}</TableCell>
            {templateName === "TEMPLATE_PUPR" ? (
                <TableCell className="border text-center">{nilaiBobot ? nilaiBobot : "-"}</TableCell>
            ) : null}
        </>
    );
});
NilaiCells.displayName = "NilaiCells";

export default NilaiCells;
