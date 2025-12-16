import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import master from "@/routes/master";
import { Pagination } from "@/types";
import { Report } from "@/types/reports";
import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

interface ReportsTableProps {
  page: Pagination<Report>;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const ReportsTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>Urut</TableHead>
        <TableHead>Jenis Laporan</TableHead>
        <TableHead>Indikator</TableHead>
        <TableHead>Deskripsi Formula</TableHead>
        <TableHead>Satuan</TableHead>
        <TableHead>Bobot</TableHead>
        <TableHead>Formula</TableHead>
      </TableRow>
    </TableHeader>
  );
});
ReportsTableHeader.displayName = "ReportsTableHeader";

interface ReportsTableActionsProps {
  row: Report;
  isSelected: boolean;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}
const ReportsTableActions = memo(
  ({
    row,
    isSelected,
    setId,
    setShowDeleteDialog,
  }: ReportsTableActionsProps) => {
    const handleDelete = useCallback(() => {
      setId(row.id);
      setShowDeleteDialog(true);
    }, [row.id, setId, setShowDeleteDialog]);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`size-8 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${isSelected ? "opacity-100" : "opacity-0"}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="text-blue-500 font-bold">
            <Link
              href={master.reports.edit.url(row.id)}
              className="flex items-center gap-2"
            >
              <PencilIcon className="size-4 text-blue-500" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-destructive focus:text-destructive font-bold"
            onClick={handleDelete}
          >
            <TrashIcon className="size-4 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
ReportsTableActions.displayName = "ReportsTableActions";

const FormulaBadge = memo(({ formula }: { formula: string }) => {
  const listFormula = formula.split(" ");
  return (
    <div className="flex gap-1">
      {listFormula.map((item, index) => (
        <Badge key={index} variant="outline">
          {item}
        </Badge>
      ))}
    </div>
  );
});
FormulaBadge.displayName = "FormulaBadge";

const ReportsTableBody = memo(
  ({ page, setId, setShowDeleteDialog }: ReportsTableProps) => {
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

    const rows = useMemo(() => {
      const firstNumber = page.meta.from;
      return page.data.map((item, index) => ({
        hash: firstNumber + index,
        ...item,
      }));
    }, [page]);
    return (
      <TableBody>
        {rows.map((item) => (
          <TableRow
            key={item.id}
            className="group"
            onClick={() =>
              setSelectedRowId(selectedRowId === item.id ? null : item.id)
            }
          >
            <TableCell className="w-16 text-center">{item.hash}</TableCell>
            <TableCell className="w-16 text-center">{item.urut}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <ReportsTableActions
                  row={item}
                  isSelected={item.id === selectedRowId}
                  setId={setId}
                  setShowDeleteDialog={setShowDeleteDialog}
                />
                <Badge variant="outline">{item.reportType.name}</Badge>
              </div>
            </TableCell>
            <TableCell>{item.descIndicator}</TableCell>
            <TableCell>{item.descFormula}</TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell>{item.weight}</TableCell>
            <TableCell>
              <FormulaBadge formula={item.formula} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  },
);

const ReportsTable = ({
  page,
  setId,
  setShowDeleteDialog,
}: ReportsTableProps) => {
  if (page.meta.total === 0) {
    return <TableEmpty tableName="Reports" />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <ReportsTableHeader />
        <ReportsTableBody
          page={page}
          setId={setId}
          setShowDeleteDialog={setShowDeleteDialog}
        />
      </Table>
    </div>
  );
};

export default ReportsTable;
