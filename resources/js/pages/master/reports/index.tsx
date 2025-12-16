import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import ReportsTable from "@/components/master/reports/report-types-table";
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
import { Report } from "@/types/reports";
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
    title: "Reports",
    href: "#",
  },
];

interface MasterReportsProps {
  page: Pagination<Report>;
}

const MasterReports = ({ page }: MasterReportsProps) => {
  const { params, handleSelectChange } = usePaginationHandler(page);
  const { id, setId, showDeleteDialog, setShowDeleteDialog } =
    useGlobalDeleteHook();
  const formUrl = useMemo(() => master.reports.destroy(id).url, [id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Reports" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Reports Management</CardTitle>
              <CardDescription>Manage your master reports</CardDescription>
            </div>
            <Button className="gap-2" asChild>
              <Link href={master.reports.add().url}>
                <PlusIcon className="h-4 w-4" />
                Add Master Report
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableShowTotalText page={page} tableName="reports">
              <TableTextSearch
                params={params}
                handleSelectChange={handleSelectChange}
                text="Kode / Description"
              />
            </TableShowTotalText>
            <ReportsTable
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

export default MasterReports;
