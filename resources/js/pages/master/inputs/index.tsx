import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import InputsTable from "@/components/master/inputs/inputs-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInputsHook } from "@/hooks/use-inputs";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem, Pagination } from "@/types";
import { MasterInput } from "@/types/master-input";
import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";

export interface InputsIndexProps {
  page: Pagination<MasterInput>;
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
  const { id, setId, showDeleteDialog, setShowDeleteDialog } = useInputsHook();
  const formUrl = useMemo(() => master.inputs.destroy(id).url, [id]);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Inputs" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Inputs Management</CardTitle>
              <CardDescription>Manage your master inputs</CardDescription>
            </div>
            <Button className="gap-2" asChild>
              <Link href={master.inputs.add().url}>
                <PlusIcon className="h-4 w-4" />
                Add Master Input
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableShowTotalText page={page} tableName="inputs">
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
            <PaginationNav page={page} />
          </CardContent>
        </Card>
      </div>
      <DeleteDialog
        formAction={formUrl}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
      />
    </AppLayout>
  );
};

export default InputsIndex;
