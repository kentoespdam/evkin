import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";

interface AspectsTableProps {
	page: Pagination<Aspect>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const AspectsTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-16 text-center">#</TableHead>
				<TableHead>Name</TableHead>
				<TableHead>ReportType</TableHead>
			</TableRow>
		</TableHeader>
	);
});
AspectsTableHeader.displayName = "AspectsTableHeader";

interface AspectsTableActionProps {
	row: Aspect;
	isSelected: boolean;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const AspectsTableActions = memo(({ row, isSelected, setId, setShowDeleteDialog }: AspectsTableActionProps) => {
	const handleDelete = useCallback(() => {
		setId(row.id);
		setShowDeleteDialog(true);
	}, [row.id, setId, setShowDeleteDialog]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={`size-8 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${isSelected ? "opacity-100" : "opacity-0"}`}
				>
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="text-blue-500 font-bold">
					<Link href={master.aspects.edit.url(row.id)} className="flex items-center gap-2">
						<PencilIcon className="size-4 text-blue-500" />
						Edit
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex items-center gap-2 text-destructive focus:text-destructive font-bold"
					onClick={handleDelete}
				>
					<TrashIcon className="size-4 text-destructive" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
AspectsTableActions.displayName = "AspectsTableActions";

const AspectsTableBody = memo(({ page, setId, setShowDeleteDialog }: AspectsTableProps) => {
	const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

	const rows = useMemo(() => {
		const firstNumber = page.meta.from;
		return page.data.map((item, index) => ({
			hash: firstNumber + index,
			...item,
		}));
	}, [page]);

	return (
		<TableBody>
			{rows.map((item) => (
				<TableRow
					key={item.id}
					className="group hover:bg-muted"
					onMouseEnter={() => setSelectedRowId(item.id)}
					onMouseLeave={() => setSelectedRowId(null)}
				>
					<TableCell className="w-16 text-center font-medium">{item.hash}</TableCell>
					<TableCell className="flex items-center gap-2">
						<AspectsTableActions
							row={item}
							isSelected={selectedRowId === item.id}
							setId={setId}
							setShowDeleteDialog={setShowDeleteDialog}
						/>
						{item.name}
					</TableCell>
					<TableCell>{item.reportType ? <Badge>{item.reportType.name}</Badge> : null}</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
});
AspectsTableBody.displayName = "AspectsTableBody";

const AspectsTable = ({ page, setId, setShowDeleteDialog }: AspectsTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Aspects" />;
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<AspectsTableHeader />
				<AspectsTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
};

export default AspectsTable;
