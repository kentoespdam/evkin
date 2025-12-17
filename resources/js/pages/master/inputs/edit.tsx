import InputsForm from "@/components/master/inputs/inputs-form";
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
import { MasterSource } from "@/types/master-source";
import { Head } from "@inertiajs/react";
import { TextCursorInputIcon } from "lucide-react";

interface MasterInputEditProps {
  data: MasterInput;
  sources: MasterSource[];
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
    href: master.inputs().url,
  },
  {
    title: "Edit",
    href: "#",
  },
];

const MasterInputEdit = ({ data, sources }: MasterInputEditProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Master Input`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TextCursorInputIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit Master Input</CardTitle>
                <CardDescription>Edit Master Input information</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <InputsForm data={data} sources={sources} />
      </div>
    </AppLayout>
  );
};

export default MasterInputEdit;
