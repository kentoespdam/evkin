import { Link } from "@inertiajs/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { MasterSource } from "@/types/master-source";

interface SourcesTableProps {
	page: Pagination<MasterSource>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

const SourcesTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-16 text-center">#</TableHead>
				<TableHead className="w-30 text-center">Aksi</TableHead>
				<TableHead>Nama Sumber</TableHead>
			</TableRow>
		</TableHeader>
	);
});
SourcesTableHeader.displayName = "SourcesTableHeader";

const SourcesTableBody = memo(({ page, setId, setShowDeleteDialog }: SourcesTableProps) => {
	const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

	const rows = useMemo(() => {
		const firstNumber = page.meta.from;
		return page.data.map((item, index) => ({
			urut: firstNumber + index,
			...item,
		}));
	}, [page]);

	return (
		<TableBody>
			{rows.map((item) => (
				<TableRow
					key={item.id}
					className="group"
					onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
				>
					<TableHead className="w-16 text-center">{item.urut}</TableHead>
					<TableHead className="w-30 text-center">
						<SourcesTableAction row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
					</TableHead>
					<TableHead>
						<div className="flex items-center gap-3">
							<div className="flex flex-col">{item.name}</div>
						</div>
					</TableHead>
				</TableRow>
			))}
		</TableBody>
	);
});
SourcesTableBody.displayName = "SourcesTableBody";

interface SourcesTableActionProps {
	row: MasterSource;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const SourcesTableAction = memo(({ row, setId, setShowDeleteDialog }: SourcesTableActionProps) => {
	const handleDelete = useCallback(() => {
		setId(row.id);
		setShowDeleteDialog(true);
	}, [row.id, setId, setShowDeleteDialog]);

	return (
		<div className="flex items-center justify-center gap-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						asChild
						size="sm"
						variant="outline"
						className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
					>
						<Link href={master.sources.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Ubah Sumber</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="sm"
						variant="outline"
						onClick={handleDelete}
						className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
					>
						<TrashIcon className="size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Hapus Sumber</TooltipContent>
			</Tooltip>
		</div>
	);
});
SourcesTableAction.displayName = "SourcesTableAction";

const SourcesTable = memo(({ page, setId, setShowDeleteDialog }: SourcesTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Data Sumber" />;
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<SourcesTableHeader />
				<SourcesTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
});

SourcesTable.displayName = "SourcesTable";

export default SourcesTable;
