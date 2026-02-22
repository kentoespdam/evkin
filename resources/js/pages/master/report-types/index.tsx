import { Head, Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import ReportTypesTable from "@/components/master/table/report-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalDeleteHook } from "@/hooks/use-global-delete-hook";
import { usePaginationHandler } from "@/hooks/use-pagination";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { ReportType } from "@/types/report-type";

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
		title: "Jenis Laporan",
		href: "#",
	},
];

export interface ReportTypesPageProps {
	page: Pagination<ReportType>;
}

const ReportTypesPage = ({ page }: ReportTypesPageProps) => {
	const { params, handleSelectChange } = usePaginationHandler(page);
	const { id, setId, showDeleteDialog, setShowDeleteDialog } = useGlobalDeleteHook();
	const deleteUrl = useMemo(() => master.reportTypes.destroy(id).url, [id]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Jenis Laporan" />
			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="flex-row items-center justify-between space-y-0">
						<div className="space-y-1">
							<CardTitle className="text-xl">Manajemen Jenis Laporan</CardTitle>
							<CardDescription>Kelola Jenis Laporan Anda</CardDescription>
						</div>
						<Button className="gap-2" asChild>
							<Link href={master.reportTypes.add().url}>
								<PlusIcon className="h-4 w-4" />
								Tambah Jenis Laporan
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<TableShowTotalText page={page} tableName="Jenis Laporan">
							<TableTextSearch params={params} handleSelectChange={handleSelectChange} text="Jenis Laporan" />
						</TableShowTotalText>
						<ReportTypesTable page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
						<PaginationNav page={page} />
					</CardContent>
				</Card>
			</div>
			<DeleteDialog
				formAction={deleteUrl}
				showDeleteDialog={showDeleteDialog}
				setShowDeleteDialog={setShowDeleteDialog}
			/>
		</AppLayout>
	);
};

export default ReportTypesPage;
