import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import RoleInputTable from "@/components/master/role-inputs/role-input-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePaginationHandler } from "@/hooks/use-pagination";
import { useRoleInputsHook } from "@/hooks/use-role-inputs";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem, Pagination } from "@/types";
import { RoleInput } from "@/types/role-input";
import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";

export interface RoleInputsIndexProps {
  page: Pagination<RoleInput>;
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
    title: "RoleInputs",
    href: "#",
  },
];

const RoleInputsIndex = ({ page }: RoleInputsIndexProps) => {
  const { params, handleSelectChange } = usePaginationHandler(page);
  const { id, setId, showDeleteDialog, setShowDeleteDialog } =
    useRoleInputsHook();

  const deleteUrl = useMemo(() => master.roleInputs.destroy(id).url, [id]);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">RoleInputs Management</CardTitle>
              <CardDescription>Manage your roles</CardDescription>
            </div>
            <Button className="gap-2" asChild>
              <Link href={master.roleInputs.add().url}>
                <PlusIcon className="h-4 w-4" />
                Add Role Input
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableShowTotalText page={page} tableName="roles">
              <TableTextSearch
                params={params}
                handleSelectChange={handleSelectChange}
                text="Role / Indikator"
              />
            </TableShowTotalText>
            <RoleInputTable
              page={page}
              setId={setId}
              setShowDeleteDialog={setShowDeleteDialog}
            />
            <PaginationNav page={page} />
          </CardContent>
        </Card>
      </div>
      <DeleteDialog
        formAction={deleteUrl}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
      />
    </AppLayout>
  );
};

export default RoleInputsIndex;
