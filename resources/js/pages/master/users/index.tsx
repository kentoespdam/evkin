import PaginationNav from "@/components/pagination-nav";
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
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { Pagination, type BreadcrumbItem } from "@/types";
import { UserWithRole } from "@/types/user";
import { Head, Link } from "@inertiajs/react";
import { MoreHorizontal } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePaginationHandler } from "@/hooks/use-pagination";
import { useDebouncedCallback } from "use-debounce";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
];

interface UsersIndexProps {
  page: Pagination<UserWithRole>;
  params: Record<string, string | string[]> | null;
}

const UserSearch = memo(({ page, params }: UsersIndexProps) => {
  const { handleSelectChange } = usePaginationHandler(page, params);
  const [search, setSearch] = useState((params?.search as string) || "");

  const debouncedSearch = useDebouncedCallback((value: string) => {
    handleSelectChange({ search: value });
  }, 300);

  return (
    <div className="w-full sm:max-w-xs p-4">
      <Input
        placeholder="Search user..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          debouncedSearch(e.target.value);
        }}
      />
    </div>
  );
});
UserSearch.displayName = "UserSearch";

const UserTable = memo(({ page }: UsersIndexProps) => {
  const rows = useMemo(() => {
    return page.data.map((item, index) => ({
      no: page.from + index,
      ...item,
    }));
  }, [page]);
  return (
    <div className="flex h-full flex-1 overflow-x-auto rounded-xl px-4">
      <Table className="border rounded-2xl">
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.no}</TableCell>
              <TableCell>
                <TableAction row={item} />
              </TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.role.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
UserTable.displayName = "UserTable";

const TableAction = memo(({ row }: { row: UserWithRole }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/users/${row.id}`} className="text-blue-500">
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/users/${row.id}`} className="text-red-500">
            Delete
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
TableAction.displayName = "TableAction";

export default function UsersIndex({ page, params }: UsersIndexProps) {
  const rows = useMemo(() => {
    return page.data.map((item, index) => ({
      no: page.from + index,
      ...item,
    }));
  }, [page]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="grid gap-1">
        <UserSearch page={page} params={params} />
        <UserTable page={page} params={params} />
        <PaginationNav page={page} params={params} />
      </div>
    </AppLayout>
  );
}
