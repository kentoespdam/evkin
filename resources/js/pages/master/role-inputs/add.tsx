import { Head } from "@inertiajs/react";
import { KeyIcon } from "lucide-react";
import RoleInputForm from "@/components/master/form/role-inputs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";
import type { MasterInput } from "@/types/master-input";
import type { Role } from "@/types/role";

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Beranda",
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
		title: "Tambah",
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
			<Head title={`Tambah Role Input`} />
			<div className="flex flex-col gap-6 p-4">
				{/* Kartu Header */}
				<Card className="border-primary/20">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<KeyIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">Tambah Role Input</CardTitle>
								<CardDescription>Tambah informasi Role Input baru</CardDescription>
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
