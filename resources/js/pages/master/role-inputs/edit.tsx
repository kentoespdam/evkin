import RoleInputForm from "@/components/master/role-inputs/role-input-form";
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
import { Role } from "@/types/role";
import { RoleInput } from "@/types/role-input";
import { Head } from "@inertiajs/react";
import { KeyIcon } from "lucide-react";

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
    title: "Role Inputs",
    href: master.roleInputs().url,
  },
  {
    title: "Edit",
    href: "#",
  },
];

interface EditRoleInputProps {
  roles: Role[];
  inputs: MasterInput[];
  data: RoleInput;
}

const EditRoleInput = ({ roles, inputs, data }: EditRoleInputProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Role Input`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <KeyIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit Role Input</CardTitle>
                <CardDescription>Edit Role Input information</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <RoleInputForm roles={roles} inputs={inputs} data={data} />
      </div>
    </AppLayout>
  );
};

export default EditRoleInput;
