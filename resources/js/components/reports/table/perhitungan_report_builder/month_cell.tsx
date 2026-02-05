import { memo, type ReactNode } from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface MonthCellProps {
    monthValue: number;
    isLastYear?: boolean;
    children?: ReactNode;
    className?: string;
    colSpan?: number;
    rowSpan?: number;
    isOddRow?: boolean;
}

const MonthCell = memo(
    ({ monthValue, isLastYear = false, children, className = "", colSpan, rowSpan, isOddRow = false }: MonthCellProps) => {
        const getMonthCellClassName = () => {
            const isOddMonth = isLastYear || monthValue % 2 === 1;
            const baseClasses = "text-center border";

            if (!isOddMonth) return baseClasses;

            return cn(baseClasses, isOddRow ? "bg-yellow-100" : "bg-yellow-50", className);
        };

        return (
            <TableCell className={getMonthCellClassName()} colSpan={colSpan} rowSpan={rowSpan}>
                {children}
            </TableCell>
        );
    },
);

MonthCell.displayName = "MonthCell";

export default MonthCell;
