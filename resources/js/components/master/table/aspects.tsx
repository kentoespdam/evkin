import { Link } from "@inertiajs/react";
import { FileTypeIcon, FunctionSquareIcon, PencilIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
			<TableRow className="bg-muted/50">
				<TableHead className="w-16 text-center font-semibold">#</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<FileTypeIcon className="h-4 w-4 text-muted-foreground" />
						Report Type
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<SparklesIcon className="h-4 w-4 text-muted-foreground" />
						Aspect Name
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<FunctionSquareIcon className="h-4 w-4 text-muted-foreground" />
						Formula Aspect
					</div>
				</TableHead>
				<TableHead className="w-24 text-center font-semibold">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
});
AspectsTableHeader.displayName = "AspectsTableHeader";

interface AspectsTableActionProps {
	row: Aspect;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const AspectsTableActions = memo(({ row, setId, setShowDeleteDialog }: AspectsTableActionProps) => {
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
						className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
					>
						<Link href={master.aspects.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Edit Aspect</TooltipContent>
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
				<TooltipContent>Delete Aspect</TooltipContent>
			</Tooltip>
		</div>
	);
});
AspectsTableActions.displayName = "AspectsTableActions";

const AspectsTableBody = memo(({ page, setId, setShowDeleteDialog }: AspectsTableProps) => {
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
				<TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
					<TableCell className="w-16 text-center">
						<Badge variant="outline" className="font-semibold">
							{item.hash}
						</Badge>
					</TableCell>
					<TableCell>
						{item.reportType ? (
							<div className="flex items-center gap-2">
								<div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-blue-500/10 to-purple-500/10">
									<FileTypeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<Badge variant="default" className="font-semibold">
										{item.reportType.name}
									</Badge>
									{item.reportType.formulaPerformance && (
										<Tooltip>
											<TooltipTrigger asChild>
												<p className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-[200px]">
													{item.reportType.formulaPerformance}
												</p>
											</TooltipTrigger>
											<TooltipContent className="max-w-md">
												<p className="font-mono text-xs whitespace-pre-wrap">{item.reportType.formulaPerformance}</p>
											</TooltipContent>
										</Tooltip>
									)}
								</div>
							</div>
						) : (
							<Badge variant="secondary">No Report Type</Badge>
						)}
					</TableCell>
					<TableCell>
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-purple-500/10 to-pink-500/10">
								<SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<p className="font-semibold text-foreground">{item.name}</p>
								{item.formulaAspect && <p className="text-xs text-muted-foreground mt-0.5">Has custom formula</p>}
							</div>
						</div>
					</TableCell>
					<TableCell>
						{item.formulaAspect ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2 max-w-md">
										<p className="text-xs font-mono text-emerald-900 dark:text-emerald-100 truncate">
											{item.formulaAspect}
										</p>
									</div>
								</TooltipTrigger>
								<TooltipContent className="max-w-md">
									<p className="font-mono text-xs whitespace-pre-wrap">{item.formulaAspect}</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<div className="bg-muted/50 border border-border rounded-md px-3 py-2">
								<span className="text-xs text-muted-foreground italic">No formula defined</span>
							</div>
						)}
					</TableCell>
					<TableCell>
						<AspectsTableActions row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
					</TableCell>
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
