import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import RoleTable from "@/components/master/table/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalDeleteHook } from "@/hooks/use-global-delete-hook";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { Role } from "@/types/role";

export interface RolesIndexProps {
	page: Pagination<Role>;
}

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
		title: "Role",
		href: "#",
	},
];

const RolesIndex = ({ page }: RolesIndexProps) => {
	const { params, handleSelectChange } = usePaginationHandler(page);
	const { id, setId, showDeleteDialog, setShowDeleteDialog } = useGlobalDeleteHook();

	const formAction = useMemo(() => master.roles.destroy(id).url, [id]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Role" />
			<div className="flex flex-col gap-6 p-4">
				<Card className="border-primary/10 shadow-lg">
					<CardHeader className="flex-row items-center justify-between space-y-0 border-b border-primary/10 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent pb-6">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold">Manajemen Role</CardTitle>
							<CardDescription className="text-base">Kelola dan atur role pengguna dalam sistem</CardDescription>
						</div>
						<Button className="gap-2 shadow-md transition-all hover:shadow-lg" asChild>
							<Link href={master.roles.add().url}>
								<PlusIcon className="h-4 w-4" />
								Tambah Role
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="space-y-4 pt-6">
						<TableShowTotalText page={page} tableName="roles">
							<TableTextSearch params={params} handleSelectChange={handleSelectChange} text="Nama Role" />
						</TableShowTotalText>
						<RoleTable page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
						<PaginationNav page={page} />
					</CardContent>
				</Card>
			</div>
			<DeleteDialog
				formAction={formAction}
				showDeleteDialog={showDeleteDialog}
				setShowDeleteDialog={setShowDeleteDialog}
			/>
		</AppLayout>
	);
};

export default RolesIndex;
