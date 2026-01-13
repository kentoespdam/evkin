import { Link } from "@inertiajs/react";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
import { Item, ItemActions, ItemContent, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { Report } from "@/types/reports";

interface ReportsTableProps {
	page: Pagination<Report>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

interface ReportsTableActionsProps {
	row: Report;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const ReportsTableActions = memo(({ row, setId, setShowDeleteDialog }: ReportsTableActionsProps) => {
	const handleDelete = useCallback(() => {
		setId(row.id);
		setShowDeleteDialog(true);
	}, [row.id, setId, setShowDeleteDialog]);

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button className="p-0">
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>More actions</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="text-blue-500 font-bold">
					<Link href={master.reports.edit.url(row.id)} className="flex items-center gap-2">
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
ReportsTableActions.displayName = "ReportsTableActions";

const RumusBadge = memo(({ rumus }: { rumus: string }) => {
	return (
		<div className="flex gap-2">
			<Badge>Rumus</Badge>
			<Badge variant={"secondary"}>{rumus}</Badge>
		</div>
	);
});
RumusBadge.displayName = "RumusBadge";

const FormulaBadge = memo(({ formula }: { formula: string }) => {
	return (
		<div className="flex gap-2">
			<Badge>Formula</Badge>
			<Badge variant={"secondary"}>{formula}</Badge>
		</div>
	);
});
FormulaBadge.displayName = "FormulaBadge";

const RulesBadge = memo(({ rules }: { rules: string | null }) => {
	const listRules = useMemo(
		() =>
			rules?.split("\n").map((row) => ({
				hash: uuidv4(),
				item: row,
			})),
		[rules],
	);

	return listRules ? (
		<div className="flex gap-2">
			<Badge className="h-fit">Rules</Badge>
			<div className="grid gap-1">
				{listRules.map((item) => (
					<Badge key={item.hash} variant="outline">
						{item.item}
					</Badge>
				))}
			</div>
		</div>
	) : (
		<span className="text-muted-foreground italic">No Rules</span>
	);
});
RulesBadge.displayName = "RulesBadge";

const ReportsTableBody = memo(({ page, setId, setShowDeleteDialog }: ReportsTableProps) => {
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
					className="group border-none"
					onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
				>
					<TableCell className="p-0">
						<Item variant={"outline"} className="mb-2">
							<ItemHeader>
								<ItemMedia>
									<Badge variant={"outline"}>{item.hash}</Badge>
								</ItemMedia>
								<div>
									{item.reportType.name} - {item.aspect.name}
								</div>
							</ItemHeader>
							<Separator />
							<ItemContent className="pl-6">
								<ItemTitle>
									<Badge>{item.urut}</Badge> {item.descIndicator} {item.unit ? <>({item.unit})</> : null}
								</ItemTitle>
								<RumusBadge rumus={item.descFormula} />
								<FormulaBadge formula={item.formula} />
								{item.withRules && <RulesBadge rules={item.rules} />}
							</ItemContent>
							<ItemActions>
								<ReportsTableActions row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
							</ItemActions>
						</Item>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
});

const ReportsTable = ({ page, setId, setShowDeleteDialog }: ReportsTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Reports" />;
	}

	return (
		<Table>
			<ReportsTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
		</Table>
	);
};

export default ReportsTable;
