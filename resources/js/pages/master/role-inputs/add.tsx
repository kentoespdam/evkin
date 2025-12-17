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
    title: "Add",
    href: "#",
  },
];

interface AddRoleInputProps {
  roles: Role[];
  inputs: MasterInput[];
}

const AddRoleInput = ({ roles, inputs }: AddRoleInputProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add Role Input`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <KeyIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Role Input</CardTitle>
                <CardDescription>
                  Add new Role Input information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <RoleInputForm roles={roles} inputs={inputs} />
      </div>
    </AppLayout>
  );
};

export default AddRoleInput;
