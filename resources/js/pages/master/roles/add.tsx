import RoleForm from "@/components/master/roles/role-form";
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
import { Head } from "@inertiajs/react";
import { UserIcon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
  {
    title: "Roles",
    href: master.roles().url,
  },
  {
    title: "Add",
    href: "#",
  },
];

const RolesAdd = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add Role`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Role</CardTitle>
                <CardDescription>Add new role information</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <RoleForm />
      </div>
    </AppLayout>
  );
};

export default RolesAdd;
