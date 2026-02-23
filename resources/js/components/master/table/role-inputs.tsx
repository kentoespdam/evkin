import { Link } from "@inertiajs/react";
import { FileTextIcon, PencilIcon, ShieldCheckIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { RoleInput } from "@/types/role-inputs";

interface RoleInputTableProps {
	page: Pagination<RoleInput>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

const RoleInputTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow className="hover:bg-transparent bg-muted/50">
				<TableHead className="w-16 text-center font-semibold">#</TableHead>
				<TableHead className="text-center font-semibold">Aksi</TableHead>
				<TableHead className="font-semibold">Role</TableHead>
				<TableHead className="font-semibold">Indikator</TableHead>
			</TableRow>
		</TableHeader>
	);
});
RoleInputTableHeader.displayName = "RoleInputTableHeader";

const RoleInputTableBody = memo(({ page, setId, setShowDeleteDialog }: RoleInputTableProps) => {
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
					className="group transition-all hover:bg-primary/5"
					onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
				>
					<TableCell className="w-16 text-center font-semibold text-muted-foreground">{item.urut}</TableCell>
					<TableCell className="w-30 text-center">
						<TableAction row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
					</TableCell>
					<TableCell>
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 ring-2 ring-blue-500/10 transition-all group-hover:scale-110 group-hover:ring-blue-500/30">
								<ShieldCheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
							</div>
							<Badge variant="secondary" className="font-semibold capitalize">
								{item.role.name}
							</Badge>
						</div>
					</TableCell>
					<TableCell>
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-2 ring-emerald-500/10 transition-all group-hover:scale-110 group-hover:ring-emerald-500/30">
								<FileTextIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="font-semibold">
										{item.masterInput.kode}
									</Badge>
								</div>
								<span className="text-sm text-muted-foreground">{item.masterInput.description}</span>
							</div>
						</div>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
});
RoleInputTableBody.displayName = "RoleInputTableBody";

interface TableActionProps {
	row: RoleInput;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const TableAction = memo(({ row, setId, setShowDeleteDialog }: TableActionProps) => {
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
						className="h-8 w-8 p-0 transition-all hover:scale-110 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:border-blue-800"
					>
						<Link href={master.roleInputs.edit.url(row.role.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent className="font-medium">Ubah Role Input</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="sm"
						variant="outline"
						onClick={handleDelete}
						className="h-8 w-8 p-0 transition-all hover:scale-110 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 dark:hover:bg-destructive/20"
					>
						<TrashIcon className="size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent className="font-medium">Hapus Role Input</TooltipContent>
			</Tooltip>
		</div>
	);
});
TableAction.displayName = "TableAction";

const RoleInputTable = ({ page, setId, setShowDeleteDialog }: RoleInputTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Data Role Indikator" />;
	}
	return (
		<div className="overflow-x-auto rounded-lg border border-primary/10">
			<Table>
				<RoleInputTableHeader />
				<RoleInputTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
};

export default RoleInputTable;
