import UserForm from "@/components/master/users/user-form";
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
import { Role } from "@/types/role";
import { UserWithRole } from "@/types/user";
import { Head } from "@inertiajs/react";
import { UserIcon } from "lucide-react";

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
    title: "Users",
    href: master.users().url,
  },
  {
    title: "Edit",
    href: "#",
  },
];

interface UsersEditProps {
  user: UserWithRole;
  roles: Role[];
}

export default function UsersEdit({ user, roles }: UsersEditProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit User - ${user.name}`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit User</CardTitle>
                <CardDescription>
                  Update User Information and Permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <UserForm user={user} roles={roles} />
      </div>
    </AppLayout>
  );
}
