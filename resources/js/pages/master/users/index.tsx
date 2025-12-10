import PaginationNav from "@/components/pagination-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { Pagination, type BreadcrumbItem } from "@/types";
import { UserWithRole } from "@/types/user";
import { Head, Link } from "@inertiajs/react";
import {
  MoreHorizontal,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { ChangeEvent, memo, useMemo, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
  {
    title: "Users",
    href: "#",
  },
];

interface UsersIndexProps {
  page: Pagination<UserWithRole>;
}

const UserSearch = memo(({ page }: UsersIndexProps) => {
  const { params, handleSelectChange } = usePaginationHandler(page);
  const search = params.search ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebouncedCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleSelectChange({ search: e.target.value });
    },
    500,
  );

  const handleClear = () => {
    handleSelectChange({ search: "" });
  };

  return (
    <div className="relative w-full sm:max-w-xs">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        id="search"
        type="text"
        name="search"
        placeholder="Search users..."
        defaultValue={search}
        className="pl-9 pr-9"
        onChange={debouncedSearch}
      />
      {search && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={handleClear}
          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors size-6 rounded-full"
        >
          <XIcon className="size-5" />
        </Button>
      )}
    </div>
  );
});
UserSearch.displayName = "UserSearch";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const UserTableHeader = memo(() => {
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

const UserTableBody = memo(({ page }: UsersIndexProps) => {
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
              <TableAction row={item} />
              <Avatar className="h-9 w-9">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(item.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{item.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground">{item.email}</TableCell>
          <TableCell>
            <Badge variant="secondary" className="capitalize">
              {item.role.name}
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
});
UserTableBody.displayName = "UserTableBody";

const UserTable = memo(({ page }: UsersIndexProps) => {
  if (page.meta.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UsersIcon className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No users found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or add a new user.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <UserTableHeader />
        <UserTableBody page={page} />
      </Table>
    </div>
  );
});
UserTable.displayName = "UserTable";

const TableAction = memo(({ row }: { row: UserWithRole }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
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
          asChild
          className="text-destructive focus:text-destructive font-bold"
        >
          <Link
            href={`/master/users/${row.id}`}
            className="flex items-center gap-2"
          >
            <TrashIcon className="size-4 text-destructive" />
            Delete
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
TableAction.displayName = "TableAction";

export default function UsersIndex({ page }: UsersIndexProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Users Management</CardTitle>
              <CardDescription>
                Manage your users and their roles
              </CardDescription>
            </div>
            <Button className="gap-2" asChild>
              <Link href={master.users.add().url}>
                <PlusIcon className="h-4 w-4" />
                Add User
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <UserSearch page={page} />
              <div className="text-sm text-muted-foreground">
                Showing {page.meta.from ?? 0} - {page.meta.to ?? 0} of{" "}
                {page.meta.total} users
              </div>
            </div>
            <UserTable page={page} />
            <PaginationNav page={page} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
