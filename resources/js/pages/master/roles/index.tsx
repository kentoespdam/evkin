import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaginationHandler } from "@/hooks/use-pagination";
import { useRolesHook } from "@/hooks/use-roles";
import { Pagination } from "@/types";
import { Role } from "@/types/role";
import RoleTable from "@/components/master/roles/role-table";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import DeleteRoleDialog from "@/components/master/roles/role-delete-dialog";

export interface RolesIndexProps {
  page: Pagination<Role>;
}

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
    title: "Roles",
    href: "#",
  },
];

const RolesIndex = ({ page }: RolesIndexProps) => {
  console.log(page);
  const { params, handleSelectChange } = usePaginationHandler(page);
  const { roleId, setRoleId, showDeleteDialog, setShowDeleteDialog } =
    useRolesHook();
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Roles Management</CardTitle>
              <CardDescription>Manage your roles</CardDescription>
            </div>
            <Button className="gap-2" asChild>
              <Link href={master.roles.add().url}>
                <PlusIcon className="h-4 w-4" />
                Add Role
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableShowTotalText page={page} tableName="roles">
              <TableTextSearch
                params={params}
                handleSelectChange={handleSelectChange}
              />
            </TableShowTotalText>
            <RoleTable
              page={page}
              setRoleId={setRoleId}
              setShowDeleteDialog={setShowDeleteDialog}
            />
            <PaginationNav page={page} />
          </CardContent>
        </Card>
      </div>
      <DeleteRoleDialog
        roleId={roleId}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
      />
    </AppLayout>
  );
};

export default RolesIndex;
