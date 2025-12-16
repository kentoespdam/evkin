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
import { Role } from "@/types/role";
import { Link } from "@inertiajs/react";
import {
  MoreHorizontal,
  PencilIcon,
  ShieldIcon,
  TrashIcon,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

interface RoleTableProps {
  page: Pagination<Role>;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

export const RoleTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>Role Name</TableHead>
      </TableRow>
    </TableHeader>
  );
});
RoleTableHeader.displayName = "RoleTableHeader";

export const RoleTableBody = memo(
  ({ page, setId, setShowDeleteDialog }: RoleTableProps) => {
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

    const rows = useMemo(() => {
      return page.data.map((item, index) => ({
        no: page.meta.from + index,
        ...item,
      }));
    }, [page.data, page.meta.from]);

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
            <TableCell className="text-center font-medium text-muted-foreground">
              {item.no}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <TableAction
                  row={item}
                  setId={setId}
                  setShowDeleteDialog={setShowDeleteDialog}
                  isSelected={selectedRowId === item.id}
                />
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <ShieldIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium capitalize">{item.name}</span>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  },
);
RoleTableBody.displayName = "RoleTableBody";

interface TableActionProps {
  row: Role;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
  isSelected: boolean;
}

const TableAction = memo(
  ({ row, setId, setShowDeleteDialog, isSelected }: TableActionProps) => {
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
              href={master.roles.edit.url(row.id)}
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
TableAction.displayName = "TableAction";

const RoleTable = memo(
  ({ page, setId, setShowDeleteDialog }: RoleTableProps) => {
    if (page.meta.total === 0) {
      return <TableEmpty tableName="Role" />;
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <RoleTableHeader />
          <RoleTableBody
            page={page}
            setId={setId}
            setShowDeleteDialog={setShowDeleteDialog}
          />
        </Table>
      </div>
    );
  },
);
RoleTable.displayName = "RoleTable";

export default RoleTable;
