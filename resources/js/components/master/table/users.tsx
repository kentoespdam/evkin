import { Link } from "@inertiajs/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { UserWithRole } from "@/types/user";

interface UserTableProps {
	page: Pagination<UserWithRole>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

const getInitials = (name: string) => {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

export const UserTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow className="hover:bg-transparent">
				<TableHead className="w-16 text-center">#</TableHead>
				<TableHead className="text-center">Aksi</TableHead>
				<TableHead>Pengguna</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Role</TableHead>
			</TableRow>
		</TableHeader>
	);
});
UserTableHeader.displayName = "UserTableHeader";

export const UserTableBody = memo(({ page, setId, setShowDeleteDialog }: UserTableProps) => {
	const rows = useMemo(() => {
		return page.data.map((item, index) => ({
			no: page.meta.from + index,
			...item,
		}));
	}, [page.data, page.meta.from]);

	return (
		<TableBody>
			{rows.map((item) => (
				<TableRow key={item.id} className="group">
					<TableCell className="text-center font-medium text-muted-foreground">{item.no}</TableCell>
					<TableCell className="w-30">
						<TableAction row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
					</TableCell>
					<TableCell>
						<div className="flex items-center gap-3">
							<Avatar className="h-9 w-9">
								<AvatarImage src={item.avatar} alt={item.name} />
								<AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
									{getInitials(item.name)}
								</AvatarFallback>
							</Avatar>
							<span className="font-medium">{item.name}</span>
						</div>
					</TableCell>
					<TableCell className="text-muted-foreground">{item.email}</TableCell>
					<TableCell>
						<Badge variant="secondary" className="capitalize">
							{item.role.name}
						</Badge>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
});
UserTableBody.displayName = "UserTableBody";

interface TableActionProps {
	row: UserWithRole;
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
						<Link href={master.users.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Ubah Pengguna</TooltipContent>
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
				<TooltipContent>Hapus Pengguna</TooltipContent>
			</Tooltip>
		</div>
	);
});
TableAction.displayName = "TableAction";

const UserTable = memo(({ page, setId, setShowDeleteDialog }: UserTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Data Pengguna" />;
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<UserTableHeader />
				<UserTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
});
UserTable.displayName = "UserTable";

export default UserTable;
