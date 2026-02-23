import { Link } from "@inertiajs/react";
import { CalendarDaysIcon, PencilIcon, ShieldIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, getRelativeTime, isWithinDays } from "@/lib/date-utils";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { Role } from "@/types/role";

interface RoleTableProps {
	page: Pagination<Role>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

export const RoleTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow className="hover:bg-transparent bg-muted/50">
				<TableHead className="w-16 text-center font-semibold">#</TableHead>
				<TableHead className="w-fit text-center font-semibold">Aksi</TableHead>
				<TableHead className="font-semibold">Nama Role</TableHead>
				<TableHead className="font-semibold">Dibuat</TableHead>
				<TableHead className="w-24 text-center font-semibold">Status</TableHead>
			</TableRow>
		</TableHeader>
	);
});
RoleTableHeader.displayName = "RoleTableHeader";

export const RoleTableBody = memo(({ page, setId, setShowDeleteDialog }: RoleTableProps) => {
	const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

	const rows = useMemo(() => {
		return page.data.map((item, index) => ({
			no: page.meta.from + index,
			...item,
		}));
	}, [page.data, page.meta.from]);

	const Icon = ({ isNew }: { isNew: boolean }) => (
		<div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10 transition-all group-hover:scale-110 group-hover:ring-primary/30">
			<ShieldIcon className="h-5 w-5 text-primary" />
			{isNew && (
				<div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
					<SparklesIcon className="h-3 w-3 text-white" />
				</div>
			)}
		</div>
	);

	return (
		<TableBody>
			{rows.map((item) => {
				const isNew = isWithinDays(item.created_at, 7);
				return (
					<TableRow
						key={item.id}
						className="group transition-all hover:bg-primary/5"
						onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
					>
						<TableCell className="text-center font-semibold text-muted-foreground">{item.no}</TableCell>
						<TableCell className="w-30 text-center">
							<TableAction
								row={item}
								setId={setId}
								setShowDeleteDialog={setShowDeleteDialog}
							/>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-4">
								<Icon isNew={isNew} />

								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="font-semibold capitalize">
											{item.name}
										</Badge>
										{isNew && (
											<Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
												Baru
											</Badge>
										)}
									</div>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2 text-sm font-medium">
									<CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
									<span>{formatDate(item.created_at)}</span>
								</div>
								<span className="text-xs text-muted-foreground">{getRelativeTime(item.created_at)}</span>
							</div>
						</TableCell>
						<TableCell className="text-center">
							<Badge variant="secondary" className="font-medium">
								Aktif
							</Badge>
						</TableCell>
					</TableRow>
				);
			})}
		</TableBody>
	);
});
RoleTableBody.displayName = "RoleTableBody";

interface TableActionProps {
	row: Role;
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
						className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
					>
						<Link href={master.roles.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Ubah Role</TooltipContent>
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
				<TooltipContent>Hapus Role</TooltipContent>
			</Tooltip>
		</div>
	);
});
TableAction.displayName = "TableAction";

const RoleTable = memo(({ page, setId, setShowDeleteDialog }: RoleTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Data Role" />;
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-primary/10">
			<Table>
				<RoleTableHeader />
				<RoleTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
});
RoleTable.displayName = "RoleTable";

export default RoleTable;
