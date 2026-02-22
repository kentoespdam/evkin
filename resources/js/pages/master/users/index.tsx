import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import UserTable from "@/components/master/table/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalDeleteHook } from "@/hooks/use-global-delete-hook";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { UserWithRole } from "@/types/user";

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
		title: "Pengguna",
		href: "#",
	},
];

export interface UsersIndexProps {
	page: Pagination<UserWithRole>;
}

export default function UsersIndex({ page }: UsersIndexProps) {
	const { params, handleSelectChange } = usePaginationHandler(page);

	const { id, setId, showDeleteDialog, setShowDeleteDialog } = useGlobalDeleteHook();

	const deleteUrl = useMemo(() => master.users.destroy(id).url, [id]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Manajemen Pengguna" />
			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="flex-row items-center justify-between space-y-0">
						<div className="space-y-1">
							<CardTitle className="text-xl">Manajemen Pengguna</CardTitle>
							<CardDescription>Kelola Pengguna dan Role mereka</CardDescription>
						</div>
						<Button className="gap-2" asChild>
							<Link href={master.users.add().url}>
								<PlusIcon className="h-4 w-4" />
								Tambah Pengguna
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<TableShowTotalText page={page} tableName="users">
							<TableTextSearch params={params} handleSelectChange={handleSelectChange} text="Pengguna, email, role" />
						</TableShowTotalText>
						<UserTable page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
						<PaginationNav page={page} />
					</CardContent>
				</Card>
				<DeleteDialog
					formAction={deleteUrl}
					showDeleteDialog={showDeleteDialog}
					setShowDeleteDialog={setShowDeleteDialog}
				/>
			</div>
		</AppLayout>
	);
}
