import { memo, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { Pagination } from "@/types";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";

interface PerhitunganReportsTableProps {
    page: Pagination<PerhitunganReportDetail>;
}

const PerhitunganReportsTableHeader = memo(() => (
    <TableHeader>
        <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Periode</TableCell>
            <TableCell>Indikator</TableCell>
            <TableCell>Rumus</TableCell>
            <TableCell>Rumus Value</TableCell>
            <TableCell>Satuan</TableCell>
            <TableCell>Nilai</TableCell>
        </TableRow>
    </TableHeader>
));
PerhitunganReportsTableHeader.displayName = "PerhitunganReportsTableHeader";

const RulesBadge = memo(({ rule }: { rule: string }) => {
    const rules = rule?.split("\n").filter((item) => item.trim()) || [];
    return (
        <div className="mt-2 bg-slate-100 text-slate-900 rounded px-3 py-2 border border-slate-300 font-mono text-xs">
            <div className="mb-2 font-semibold">Rules:</div>
            <div>
                {rules.map((item, index) => {
                    const isLast = index === rules.length - 1;
                    const prefix = isLast ? "└── " : "├── ";
                    return (
                        <div key={item}>
                            {prefix}
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
RulesBadge.displayName = "RulesBadge";

const RumusCell = memo(({ item }: { item: PerhitunganReportDetail }) => {
    return (
        <TableCell>
            <div className="whitespace-nowrap">
                {item.formula}
                {item.masterReport.withRules && <RulesBadge rule={item.masterReport.rules || ""} />}
            </div>
        </TableCell>
    );
});
RumusCell.displayName = "RumusCell";

const PerhitunganReportsTableBody = memo(({ page }: { page: Pagination<PerhitunganReportDetail> }) => {
    const rows = useMemo(() => {
        const firstNumber = page.meta.from;
        return page.data.map((item, index) => ({
            urut: firstNumber + index,
            ...item,
        }));
    }, [page]);
    return (
        <TableBody>
            {rows.map((row) => (
                <TableRow key={row.id}>
                    <TableCell>{row.urut}</TableCell>
                    <TableCell>{`${row.year}-${row.month}`}</TableCell>
                    <TableCell>{row.descIndicator}</TableCell>
                    <RumusCell item={row} />
                    <TableCell>{row.formulaValue}</TableCell>
                    <TableCell>{row.masterReport?.unit}</TableCell>
                    <TableCell>{row.nilai}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
});
PerhitunganReportsTableBody.displayName = "PerhitunganReportsTableBody";

const PerhitunganReportsTable = ({ page }: PerhitunganReportsTableProps) => {
    const rows = page.data;

    if (!rows.length) {
        return <div className="text-sm text-muted-foreground px-4 py-6">No data found.</div>;
    }

    return (
        <div className="space-y-3">
            <Table>
                <PerhitunganReportsTableHeader />
                <PerhitunganReportsTableBody page={page} />
            </Table>
        </div>
    );
};
export default PerhitunganReportsTable;
