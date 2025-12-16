import TableEmpty from "@/components/commons/table-empty";
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
import { ReportType } from "@/types/report-types";
import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

interface ReportTypesTableProps {
  page: Pagination<ReportType>;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const ReportTypesTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>Name</TableHead>
      </TableRow>
    </TableHeader>
  );
});
ReportTypesTableHeader.displayName = "ReportTypesTableHeader";

interface ReportTypesTableActionsProps {
  row: ReportType;
  isSelected: boolean;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const ReportTypesTableActions = memo(
  ({
    row,
    isSelected,
    setId,
    setShowDeleteDialog,
  }: ReportTypesTableActionsProps) => {
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
              href={master.reportTypes.edit.url(row.id)}
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
ReportTypesTableActions.displayName = "ReportTypesTableActions";

const ReportTypesTableBody = memo(
  ({ page, setId, setShowDeleteDialog }: ReportTypesTableProps) => {
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

    const rows = useMemo(() => {
      const firstNumber = page.meta.from;
      return page.data.map((item, index) => ({
        urut: firstNumber + index,
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
            <TableCell className="w-16 text-center">{item.urut}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <ReportTypesTableActions
                  row={item}
                  isSelected={item.id === selectedRowId}
                  setId={setId}
                  setShowDeleteDialog={setShowDeleteDialog}
                />
                {item.name}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  },
);
ReportTypesTableBody.displayName = "ReportTypesTableBody";

const ReportTypesTable = ({
  page,
  setId,
  setShowDeleteDialog,
}: ReportTypesTableProps) => {
  if (page.meta.total === 0) {
    return <TableEmpty tableName="Report Types" />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <ReportTypesTableHeader />
        <ReportTypesTableBody
          page={page}
          setId={setId}
          setShowDeleteDialog={setShowDeleteDialog}
        />
      </Table>
    </div>
  );
};

export default ReportTypesTable;
