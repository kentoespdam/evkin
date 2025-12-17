import ReportTypesForm from "@/components/master/report-types/report-types-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import { BreadcrumbItem } from "@/types";
import { ReportType } from "@/types/report-types";
import { Head } from "@inertiajs/react";

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
    title: "Report Types",
    href: master.reportTypes().url,
  },
  {
    title: "Edit",
    href: "#",
  },
];

interface ReportTypesEditProps {
  data: ReportType;
}

const ReportTypesEdit = ({ data }: ReportTypesEditProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Report Type" />
      <div className="flex flex-col gap-6 p-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl">Edit Report Type</CardTitle>
              <CardDescription>Edit Report Type</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <ReportTypesForm data={data} />
      </div>
    </AppLayout>
  );
};

export default ReportTypesEdit;
