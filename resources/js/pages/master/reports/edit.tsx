import ReportsForm from "@/components/master/reports/report-types-form";
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
import { MasterInput } from "@/types/master-input";
import { ReportType } from "@/types/report-types";
import { Report } from "@/types/reports";
import { Head } from "@inertiajs/react";
import { FileTextIcon } from "lucide-react";

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
    href: master.reports().url,
  },
  {
    title: "Edit",
    href: "#",
  },
];

interface MasterReportAddProps {
  reportTypes: ReportType[];
  availableCode: MasterInput[];
  data: Report;
}

const MasterReportEdit = ({
  reportTypes,
  availableCode,
  data,
}: MasterReportAddProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Master Report`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileTextIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit Master Report</CardTitle>
                <CardDescription>
                  Edit Master Report information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <ReportsForm
          data={data}
          reportType={reportTypes}
          availableCode={availableCode}
        />
      </div>
    </AppLayout>
  );
};

export default MasterReportEdit;
