import SourcesForm from "@/components/master/sources/sources-form";
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
import { MasterSource } from "@/types/master-source";
import { Head } from "@inertiajs/react";
import { GitPullRequestArrow } from "lucide-react";

interface SourcesAddProps {
  source: MasterSource;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
  {
    title: "Sources",
    href: master.sources().url,
  },
  {
    title: "Add",
    href: "#",
  },
];

const SourcesAdd = ({ source }: SourcesAddProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add Source`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GitPullRequestArrow className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Source</CardTitle>
                <CardDescription>Add new source information</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <SourcesForm source={source} />
      </div>
    </AppLayout>
  );
};

export default SourcesAdd;
