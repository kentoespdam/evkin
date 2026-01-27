import { Link } from "@inertiajs/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import TableEmpty from "@/components/commons/table-empty";
import FormulaIndicatorTooltip from "@/components/commons/tooltip_formula_indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemHeader, ItemMedia } from "@/components/ui/item";
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
		<div className="grid items-center gap-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						asChild
						size="sm"
						variant="outline"
						className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
					>
						<Link href={master.reports.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Edit</TooltipContent>
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
				<TooltipContent>Delete</TooltipContent>
			</Tooltip>
		</div>
	);
});
ReportsTableActions.displayName = "ReportsTableActions";

const RumusBadge = memo(({ rumus }: { rumus: string }) => {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rumus</span>
			<div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
				<p className="text-sm font-medium text-blue-900 dark:text-blue-100">{rumus}</p>
			</div>
		</div>
	);
});
RumusBadge.displayName = "RumusBadge";

const FormulaIndicatorBadge = memo(({ formulaIndicator }: { formulaIndicator: string }) => {
	const rows = useMemo(
		() =>
			formulaIndicator
				? formulaIndicator.split("\n").map((row) => ({
					hash: uuidv4(),
					item: row,
				}))
				: [],
		[formulaIndicator],
	);

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex gap-2">
				<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Formula Indikator</span>
				<FormulaIndicatorTooltip />
			</div>
			<div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-md px-3 py-2 font-mono">
				{rows.map((row) => (
					<p key={row.hash} className="text-sm text-purple-900 dark:text-purple-100 break-all">
						{row.item}
					</p>
				))}
			</div>
		</div>
	);
});
FormulaIndicatorBadge.displayName = "FormulaIndicatorBadge";

const FormulaBadge = memo(({ formula }: { formula: string }) => {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Formula</span>
			<div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2 font-mono">
				<p className="text-sm text-emerald-900 dark:text-emerald-100 break-all">{formula}</p>
			</div>
		</div>
	);
});
FormulaBadge.displayName = "FormulaBadge";

const FormulaArchivementBadge = memo(({ formula }: { formula: string }) => {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Formula Pencapaian</span>
			<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 font-mono">
				<p className="text-sm text-amber-900 dark:text-amber-100 break-all">{formula}</p>
			</div>
		</div>
	);
});
FormulaArchivementBadge.displayName = "FormulaArchivementBadge";

const RulesBadge = memo(({ rules }: { rules: string | null }) => {
	const listRules = useMemo(
		() =>
			rules?.split("\n").map((row) => ({
				hash: uuidv4(),
				item: row,
			})),
		[rules],
	);

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rules</span>
			{listRules ? (
				<div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
					<div className="flex flex-col gap-2">
						{listRules.map((item, index) => (
							<div key={item.hash} className="flex items-start gap-2">
								<Badge variant="outline" className="shrink-0 bg-white dark:bg-gray-800">
									{index + 1}
								</Badge>
								<span className="text-sm text-amber-900 dark:text-amber-100 font-mono break-all">{item.item}</span>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2">
					<span className="text-sm text-muted-foreground italic">No Rules Defined</span>
				</div>
			)}
		</div>
	);
});
RulesBadge.displayName = "RulesBadge";

const ReportsTableBody = memo(({ page, setId, setShowDeleteDialog }: ReportsTableProps) => {
	const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

	return (
		<TableBody>
			{page.data.map((item) => (
				<TableRow
					key={item.id}
					className="group border-none"
					onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
				>
					<TableCell className="p-0">
						<Item variant={"outline"} className="mb-4 hover:shadow-md transition-shadow">
							<ItemHeader>
								<ItemMedia>
									<Badge variant={"outline"} className="font-semibold bg-white dark:bg-gray-950">
										#{item.seq ?? 0}
									</Badge>
								</ItemMedia>
								<div className="flex items-center gap-2 flex-wrap">
									<Badge variant="default" className="font-semibold">
										{item.reportType.name}
									</Badge>
									<span className="text-muted-foreground">•</span>
									<Badge variant="secondary" className="font-semibold">
										{item.aspect.name}
									</Badge>
								</div>
							</ItemHeader>
							<Separator />
							<ItemContent className="pl-6 py-4 space-y-4">
								<div className="flex items-center gap-3 pb-3 border-b">
									<Badge className="shrink-0 text-base px-3 py-1">{item.urut}</Badge>
									<div className="flex-1">
										<p className="text-base font-semibold leading-relaxed">{item.descIndicator}</p>
										{item.unit && (
											<p className="text-sm text-muted-foreground mt-1">
												Unit: <span className="font-medium">{item.unit}</span>
											</p>
										)}
									</div>
								</div>
								<div className="space-y-3">
									<RumusBadge rumus={item.descFormula} />
									<FormulaIndicatorBadge formulaIndicator={item.formulaIndicator} />
									<FormulaBadge formula={item.formula} />
									<FormulaArchivementBadge formula={item.formulaArchivement} />
									{item.withRules && <RulesBadge rules={item.rules} />}
								</div>
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
