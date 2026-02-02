import { memo } from "react";
import { TableHead, TableHeader, TableRow } from "../ui/table";

interface SectionHeaderRekapBuilderProps {
    title: string;
    colSpan: number;
    label?: string;
    bgColor?: string;
    textColor?: string;
}
const SectionHeaderRekapBuilder = memo(
    ({
        label,
        title,
        colSpan,
        bgColor = "bg-muted/50",
        textColor = "text-foreground"
    }: SectionHeaderRekapBuilderProps) => (
        <TableHeader>
            <TableRow>
                <TableHead colSpan={colSpan} className={`border ${bgColor} uppercase font-bold`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${textColor}/70`}>{label}</span>
                        <span className={`text-sm font-bold ${textColor}`}>{title}</span>
                    </div>
                </TableHead>
            </TableRow>
        </TableHeader>
    ),
);

export default SectionHeaderRekapBuilder;