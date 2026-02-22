import { Head } from "@inertiajs/react";
import { UserIcon } from "lucide-react";
import RoleForm from "@/components/master/form/roles";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Beranda",
		href: dashboard().url,
	},
	{
		title: "Data Master",
		href: "#",
	},
	{
		title: "Role",
		href: master.roles().url,
	},
	{
		title: "Tambah",
		href: "#",
	},
];

const RolesAdd = () => {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Tambah Role`} />
			<div className="flex flex-col gap-6 p-4">
				{/* Header Card */}
				<Card className="border-primary/20">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<UserIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">Tambah Role</CardTitle>
								<CardDescription>Tambah informasi peran baru</CardDescription>
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
