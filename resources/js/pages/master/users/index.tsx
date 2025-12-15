import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import UserTable from "@/components/master/users/user-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePaginationHandler } from "@/hooks/use-pagination";
import { useUserHook } from "@/hooks/use-user-hook";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem, Pagination } from "@/types";
import { UserWithRole } from "@/types/user";
import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
  {
    title: "Master",
    href: "#",
  },
  {
    title: "Users",
    href: "#",
  },
];

export interface UsersIndexProps {
  page: Pagination<UserWithRole>;
}

export default function UsersIndex({ page }: UsersIndexProps) {
  const { params, handleSelectChange } = usePaginationHandler(page);

  const { userId, setUserId, showDeleteDialog, setShowDeleteDialog } =
    useUserHook();

  const deleteUrl = useMemo(() => master.users.destroy(userId).url, [userId]);

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
            <TableShowTotalText page={page} tableName="users">
              <TableTextSearch
                params={params}
                handleSelectChange={handleSelectChange}
              />
            </TableShowTotalText>
            <UserTable
              page={page}
              setUserId={setUserId}
              setShowDeleteDialog={setShowDeleteDialog}
            />
            <PaginationNav page={page} />
          </CardContent>
        </Card>
        <DeleteDialog
          formAction={deleteUrl}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
        />
      </div>
    </AppLayout>
  );
}
