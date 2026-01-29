import { memo } from "react";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Pagination } from "@/types";
import type { RekapInputTahunan, RekapInputTahunanFilters } from "@/types/rekap-tahunan";

interface RekapInputTahunansTableProps {
    page: Pagination<RekapInputTahunan>;
    filters: RekapInputTahunanFilters;
}

const RekapInputTahunansTableHeader = memo(() => {
    return (
        <TableHeader>
            <TableRow>
                <TableHead>#</TableHead>
            </TableRow>
        </TableHeader>
    );
});
RekapInputTahunansTableHeader.displayName = "RekapInputTahunansTableHeader";

const RekapInputTahunansTable = ({ page, filters }: RekapInputTahunansTableProps) => {
    return (
        <Table>
            <RekapInputTahunansTableHeader />
        </Table>
    );
};

export default RekapInputTahunansTable;
