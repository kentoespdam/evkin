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
import { Head } from "@inertiajs/react";
import { UserIcon } from "lucide-react";

interface InputUserProps {
  roles: Role[];
}
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
  {
    title: "Users",
    href: master.users().url,
  },
  {
    title: "Add",
    href: "#",
  },
];

const InputUser = ({ roles }: InputUserProps) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add User`} />
      <div className="flex flex-col gap-6 p-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add User</CardTitle>
                <CardDescription>
                  Add new user information and permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <UserForm roles={roles} />
      </div>
    </AppLayout>
  );
};

export default InputUser;
