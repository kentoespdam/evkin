import { BreadcrumbItem } from "@/types";
import master from "@/routes/master";
import { dashboard } from "@/routes";
import { Role } from "@/types/role";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { UserIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RoleForm from "@/components/master/roles/role-form";

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
    title: "Roles",
    href: master.roles().url,
  },
  {
    title: "Edit",
    href: "#",
  },
];

interface RoleEditProps {
  role?: Role;
}

const RoleEdit = ({ role }: RoleEditProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Role`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit Role</CardTitle>
                <CardDescription>Edit Role information</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <RoleForm role={role} />
      </div>
    </AppLayout>
  );
};

export default RoleEdit;
