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
import { MasterInput } from "@/types/master-input";
import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

interface InputsTableProps {
  page: Pagination<MasterInput>;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const InputsTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>Kode</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Source</TableHead>
      </TableRow>
    </TableHeader>
  );
});
InputsTableHeader.displayName = "InputsTableHeader";

const InputsTableBody = memo(
  ({ page, setId, setShowDeleteDialog }: InputsTableProps) => {
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
                <InputTableActions
                  row={item}
                  isSelected={item.id === selectedRowId}
                  setId={setId}
                  setShowDeleteDialog={setShowDeleteDialog}
                />
                {item.kode}
              </div>
            </TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {item.masterSource.name}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  },
);
InputsTableBody.displayName = "InputsTableBody";

interface InputTableActionsProps {
  row: MasterInput;
  isSelected: boolean;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}
const InputTableActions = memo(
  ({ row, isSelected, setId, setShowDeleteDialog }: InputTableActionsProps) => {
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
              href={master.inputs.edit.url(row.id)}
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
InputTableActions.displayName = "InputTableActions";

const InputsTable = memo(
  ({ page, setId, setShowDeleteDialog }: InputsTableProps) => {
    if (page.meta.total === 0) {
      return <TableEmpty tableName="Master Input" />;
    }
    return (
      <div className="overflow-x-auto">
        <Table>
          <InputsTableHeader />
          <InputsTableBody
            page={page}
            setId={setId}
            setShowDeleteDialog={setShowDeleteDialog}
          />
        </Table>
      </div>
    );
  },
);

InputsTable.displayName = "InputsTable";

export default InputsTable;
