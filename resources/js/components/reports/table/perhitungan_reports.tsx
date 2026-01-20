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
                    <TableCell>{row.formula}</TableCell>
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
                {/* {rows.map((row, idx) => (
                <Item key={row.id} variant="outline" className="w-full">
                    <ItemHeader>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{page.meta.from + idx}</Badge>
                            {row.masterReport?.reportType?.name && <Badge>{row.masterReport.reportType.name}</Badge>}
                            {row.masterReport?.aspects?.name && <Badge variant="secondary">{row.masterReport.aspects.name}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Year {row.year}</Badge>
                            <Badge variant="outline">Month {row.month}</Badge>
                        </div>
                    </ItemHeader>

                    <ItemSeparator />

                    <ItemContent>
                        <ItemTitle>{row.descIndicator}</ItemTitle>
                        <div className="space-y-1 text-sm">
                            <div>
                                <span className="font-medium">Formula:</span> {row.formula}
                            </div>
                            <div>
                                <span className="font-medium">Value:</span> {row.formulaValue}
                            </div>
                            <div>
                                <span className="font-medium">Nilai:</span> {formatNumber(row.nilai, 2)}
                            </div>
                        </div>
                    </ItemContent>
                </Item>
            ))} */}
            </Table>
        </div>
    );
};
export default PerhitunganReportsTable;
