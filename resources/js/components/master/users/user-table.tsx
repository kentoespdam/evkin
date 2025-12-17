import TableEmpty from "@/components/commons/table-empty";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Pagination } from "@/types";
import { UserWithRole } from "@/types/user";
import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

interface UserTableProps {
  page: Pagination<UserWithRole>;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const UserTableHeader = memo(() => {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>User</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
      </TableRow>
    </TableHeader>
  );
});
UserTableHeader.displayName = "UserTableHeader";

export const UserTableBody = memo(
  ({ page, setId, setShowDeleteDialog }: UserTableProps) => {
    const rows = useMemo(() => {
      return page.data.map((item, index) => ({
        no: page.meta.from + index,
        ...item,
      }));
    }, [page.data, page.meta.from]);

    return (
      <TableBody>
        {rows.map((item) => (
          <TableRow key={item.id} className="group">
            <TableCell className="text-center font-medium text-muted-foreground">
              {item.no}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <TableAction
                  row={item}
                  setId={setId}
                  setShowDeleteDialog={setShowDeleteDialog}
                />
                <Avatar className="h-9 w-9">
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(item.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{item.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.email}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {item.role.name}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  },
);
UserTableBody.displayName = "UserTableBody";

interface TableActionProps {
  row: UserWithRole;
  setId: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
}
const TableAction = memo(
  ({ row, setId, setShowDeleteDialog }: TableActionProps) => {
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
            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="text-blue-500 font-bold">
            <Link
              href={`/master/users/${row.id}/edit`}
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

const UserTable = memo(
  ({ page, setId, setShowDeleteDialog }: UserTableProps) => {
    if (page.meta.total === 0) {
      return <TableEmpty tableName="Master Users" />;
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <UserTableHeader />
          <UserTableBody
            page={page}
            setId={setId}
            setShowDeleteDialog={setShowDeleteDialog}
          />
        </Table>
      </div>
    );
  },
);
UserTable.displayName = "UserTable";

export default UserTable;
