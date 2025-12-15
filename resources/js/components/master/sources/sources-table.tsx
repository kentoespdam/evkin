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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import master from "@/routes/master";
import { Pagination } from "@/types";
import { MasterSource } from "@/types/master-source";
import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

interface SourcesTableProps {
  page: Pagination<MasterSource>;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const SourcesTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>Source Name</TableHead>
      </TableRow>
    </TableHeader>
  );
});
SourcesTableHeader.displayName = "SourcesTableHeader";

const SourcesTableBody = memo(
  ({ page, setId, setShowDeleteDialog }: SourcesTableProps) => {
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
            <TableHead className="w-16 text-center">{item.urut}</TableHead>
            <TableHead>
              <div className="flex items-center gap-3">
                <SourcesTableAction
                  row={item}
                  setId={setId}
                  setShowDeleteDialog={setShowDeleteDialog}
                  isSelected={selectedRowId === item.id}
                />
                <div className="flex flex-col">{item.name}</div>
              </div>
            </TableHead>
          </TableRow>
        ))}
      </TableBody>
    );
  },
);
SourcesTableBody.displayName = "SourcesTableBody";

interface SourcesTableActionProps {
  row: MasterSource;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
  isSelected: boolean;
}
const SourcesTableAction = memo(
  ({
    row,
    setId,
    setShowDeleteDialog,
    isSelected,
  }: SourcesTableActionProps) => {
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
              href={master.sources.edit.url(row.id)}
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
SourcesTableAction.displayName = "SourcesTableAction";

const SourcesTable = memo(
  ({ page, setId, setShowDeleteDialog }: SourcesTableProps) => {
    if (page.meta.total === 0) {
      return <TableEmpty />;
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <SourcesTableHeader />
          <SourcesTableBody
            page={page}
            setId={setId}
            setShowDeleteDialog={setShowDeleteDialog}
          />
        </Table>
      </div>
    );
  },
);

SourcesTable.displayName = "SourcesTable";

export default SourcesTable;
