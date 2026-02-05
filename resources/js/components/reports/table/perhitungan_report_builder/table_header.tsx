import { memo } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    BORDER_CLASS,
    getMonthCellClassName,
    PX_42,
    TEXT_CENTER_CLASS,
    YELLOW_ODD_CLASS,
} from "@/lib/component_helper";
import { cn, type MonthOption } from "@/lib/utils";
import NilaiPencapaianHeaderCellBuilder from "./table_header_nilai_capaian";

export interface TableHeaderProps {
    year: number;
    months: MonthOption[];
    templateName: string;
    showUnitColumn?: boolean;
    showFormulaColumn?: boolean;
}

const RekapTableHeader = memo(({ year, months, showUnitColumn = true, showFormulaColumn = true, templateName }: TableHeaderProps) => {
    const colSpan = templateName === "TEMPLATE_KEPMENDAGRI" ? 2 : 3;

    return (
        <TableHeader>
            <TableRow>
                <TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)} rowSpan={2}>
                    NO
                </TableHead>
                <TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS, PX_42)} rowSpan={2}>
                    INDIKATOR
                </TableHead>

                {showFormulaColumn && (
                    <TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS, PX_42)} rowSpan={2}>
                        RUMUS
                    </TableHead>
                )}

                {showUnitColumn && (
                    <TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS)} rowSpan={2}>
                        SATUAN
                    </TableHead>
                )}

                <TableHead className={cn("whitespace-pre-wrap", BORDER_CLASS, TEXT_CENTER_CLASS)} rowSpan={2}>
                    BOBOT (%)
                </TableHead>

                {months.map((month) => (
                    <TableHead key={`month-${month.value}`} className={getMonthCellClassName(month.value)} colSpan={colSpan}>
                        {month.label} {year}
                    </TableHead>
                ))}

                <TableHead className={cn(BORDER_CLASS, TEXT_CENTER_CLASS, YELLOW_ODD_CLASS)} colSpan={colSpan}>
                    Desember {year - 1}
                </TableHead>
            </TableRow>

            <TableRow>
                {months.map((month) => (
                    <NilaiPencapaianHeaderCellBuilder
                        key={`header-cell-${month.value}`}
                        className={month.value % 2 === 1 ? YELLOW_ODD_CLASS : ""}
                        templateName={templateName}
                    />
                ))}
                <NilaiPencapaianHeaderCellBuilder className={YELLOW_ODD_CLASS} templateName={templateName} />
            </TableRow>
        </TableHeader>
    );
});

RekapTableHeader.displayName = "RekapTableHeader";

export default RekapTableHeader;
