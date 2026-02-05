import { memo } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BORDER_CLASS } from "@/lib/component_helper";
import { cn, type MonthOption } from "@/lib/utils";
import NilaiRowBuilder from "./nilai_cell";

interface AspectFooterProps {
    label: string
    monthlyTotals: Map<
        number,
        {
            totalNilaiIndicator: number;
            totalBobot: number;
            nilaiKinerja: number;
        }
    >;
    totalTahunLalu: number;
    nilaiKinerjaTahunLalu: number;
    nilaiBobotTahunLalu: number;
    months: MonthOption[];
    templateName: string;
    showUnitColumn?: boolean;
    showFormulaColumn?: boolean;
}

const AspectFooter = memo(
    ({
        label,
        monthlyTotals,
        totalTahunLalu,
        nilaiKinerjaTahunLalu,
        nilaiBobotTahunLalu,
        months,
        showUnitColumn = true,
        showFormulaColumn = true,
        templateName = "TEMPLATE_KEPMENDAGRI",
    }: AspectFooterProps) => {
        const colSpanBase = 3 + (showUnitColumn ? 1 : 0) + (showFormulaColumn ? 1 : 0);

        return templateName === "TEMPLATE_KEPMENDAGRI" ? (
            <TableHeader>
                <TableRow className="border-t-8 bg-accent">
                    <TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase}>
                        Jumlah Nilai Yang diperoleh
                    </TableHead>
                    {months.map((month) => {
                        const total = monthlyTotals.get(month.value);
                        return (
                            <NilaiRowBuilder
                                key={`total-${month.value}`}
                                monthValue={month.value}
                                nilaiIndicator={total?.totalNilaiIndicator}
                                precision={0}
                                templateName={templateName}
                            />
                        );
                    })}
                    <NilaiRowBuilder key={`total-${12}`} monthValue={13} nilaiIndicator={totalTahunLalu} precision={0} templateName={templateName} />
                </TableRow>

                <TableRow className="bg-accent">
                    <TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase - 3}>
                        {label}
                    </TableHead>
                    <TableHead className={cn(BORDER_CLASS)} colSpan={3}>
                        (Jumlah Perolehan Nilai : Nilai Maksimal) x Bobot
                    </TableHead>
                    {months.map((month) => {
                        const total = monthlyTotals.get(month.value);
                        return (
                            <NilaiRowBuilder
                                key={`kinerja-${month.value}`}
                                monthValue={month.value}
                                nilaiIndicator={total?.nilaiKinerja}
                                precision={2}
                                className="text-xl text-destructive"
                                isOddRow={true}
                                templateName={templateName}
                            />
                        );
                    })}
                    <NilaiRowBuilder
                        monthValue={12}
                        isLastYear={true}
                        nilaiIndicator={nilaiKinerjaTahunLalu}
                        className="text-xl text-destructive"
                        precision={2}
                        isOddRow={true}
                        templateName={templateName}
                    />
                </TableRow>

                <TableRow>
                    <TableHead className="h-8" colSpan={2} />
                </TableRow>
            </TableHeader>
        ) : (
            <TableHeader>
                <TableRow className="border-t-8 bg-accent">
                    <TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase}>
                        {label}
                    </TableHead>
                    {months.map((month) => {
                        const total = monthlyTotals.get(month.value);
                        return (
                            <NilaiRowBuilder
                                key={`total-${month.value}`}
                                monthValue={month.value}
                                nilaiBobot={total?.totalBobot}
                                className="text-xl text-destructive"
                                precision={0}
                                templateName={templateName}
                            />
                        );
                    })}
                    <NilaiRowBuilder
                        monthValue={12}
                        isLastYear={true}
                        nilaiBobot={nilaiBobotTahunLalu}
                        className="text-xl text-destructive"
                        precision={2}
                        isOddRow={true}
                        templateName={templateName}
                    />
                </TableRow>

                <TableRow>
                    <TableHead className="h-8" colSpan={2} />
                </TableRow>
            </TableHeader>
        )
    },
);

AspectFooter.displayName = "AspectFooter";

export default AspectFooter;
