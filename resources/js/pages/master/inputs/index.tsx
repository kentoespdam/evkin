import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import InputsTable from "@/components/master/sources/sources-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem, Pagination } from "@/types";
import { MasterSource } from "@/types/master-source";
import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";

export interface InputsIndexProps {
  page: Pagination<MasterSource>;
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
    title: "Inputs",
    href: "#",
  },
];

const InputsIndex = ({ page }: InputsIndexProps) => {
  const { params, handleSelectChange } = usePaginationHandler(page);
  // const { id, setId, showDeleteDialog, setShowDeleteDialog } =
  //     useInputsHook();
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Inputs" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Inputs Management</CardTitle>
              <CardDescription>Manage your roles</CardDescription>
            </div>
            <Button className="gap-2" asChild>
              <Link href={master.roles.add().url}>
                <PlusIcon className="h-4 w-4" />
                Add Source
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <TableShowTotalText page={page} tableName="roles">
                            <TableTextSearch
                                params={params}
                                handleSelectChange={handleSelectChange}
                            />
                        </TableShowTotalText>
                        <InputsTable
                            page={page}
                            setId={setId}
                            setShowDeleteDialog={setShowDeleteDialog}
                        />
                        <PaginationNav page={page} /> */}
          </CardContent>
        </Card>
      </div>
      {/* <DeleteDialog
                formAction={master.sources.destroy.form(id)}
                showDeleteDialog={showDeleteDialog}
                setShowDeleteDialog={setShowDeleteDialog}
            /> */}
    </AppLayout>
  );
};

export default InputsIndex;
