import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import RoleTable from "@/components/master/roles/role-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGlobalDeleteHook } from "@/hooks/use-global-delete-hook";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem, Pagination } from "@/types";
import { Role } from "@/types/role";
import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";

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
  const { params, handleSelectChange } = usePaginationHandler(page);
  const { id, setId, showDeleteDialog, setShowDeleteDialog } =
    useGlobalDeleteHook();

  const formAction = useMemo(() => master.roles.destroy(id).url, [id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Roles Management</CardTitle>
              <CardDescription>Manage your Roles</CardDescription>
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
                text="Role Name"
              />
            </TableShowTotalText>
            <RoleTable
              page={page}
              setId={setId}
              setShowDeleteDialog={setShowDeleteDialog}
            />
            <PaginationNav page={page} />
          </CardContent>
        </Card>
      </div>
      <DeleteDialog
        formAction={formAction}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
      />
    </AppLayout>
  );
};

export default RolesIndex;
