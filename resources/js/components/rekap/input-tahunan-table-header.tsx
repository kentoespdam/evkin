import { memo } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RekapInputTahunansTableHeaderProps {
    years: number[];
}

export const RekapInputTahunansTableHeader = memo(({ years }: RekapInputTahunansTableHeaderProps) => (
    <TableHeader>
        <TableRow className="bg-muted/50">
            <TableHead className="w-16 border text-center font-semibold">#</TableHead>
            <TableHead className="min-w-[260px] border font-semibold">Indikator</TableHead>
            <TableHead className="min-w-[180px] border font-semibold">Sumber Data</TableHead>
            <TableHead className="w-24 border text-center font-semibold">Satuan</TableHead>
            {years.map((year) => (
                <TableHead key={year} className="border text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                        <span>{year}</span>
                    </div>
                </TableHead>
            ))}
        </TableRow>
    </TableHeader>
));

RekapInputTahunansTableHeader.displayName = "RekapInputTahunansTableHeader";