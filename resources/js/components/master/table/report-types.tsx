import { Link } from "@inertiajs/react";
import { FileTypeIcon, FunctionSquareIcon, LayoutTemplateIcon, PencilIcon, TagIcon, TrashIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { ReportType } from "@/types/report-type";

interface ReportTypesTableProps {
	page: Pagination<ReportType>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

const ReportTypesTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow className="bg-muted/50">
				<TableHead className="w-16 text-center font-semibold">#</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<TagIcon className="h-4 w-4 text-muted-foreground" />
						Nama Tipe Laporan
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<LayoutTemplateIcon className="h-4 w-4 text-muted-foreground" />
						Template
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<FunctionSquareIcon className="h-4 w-4 text-muted-foreground" />
						Formula Kinerja
					</div>
				</TableHead>
				<TableHead className="w-24 text-center font-semibold">Aksi</TableHead>
			</TableRow>
		</TableHeader>
	);
});
ReportTypesTableHeader.displayName = "ReportTypesTableHeader";

interface ReportTypesTableActionsProps {
	row: ReportType;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

const ReportTypesTableActions = memo(({ row, setId, setShowDeleteDialog }: ReportTypesTableActionsProps) => {
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
						<Link href={master.reportTypes.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Ubah Tipe Laporan</TooltipContent>
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
				<TooltipContent>Hapus Tipe Laporan</TooltipContent>
			</Tooltip>
		</div>
	);
});
ReportTypesTableActions.displayName = "ReportTypesTableActions";

const ReportTypesTableBody = memo(({ page, setId, setShowDeleteDialog }: ReportTypesTableProps) => {
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
				<TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
					<TableCell className="w-16 text-center">
						<Badge variant="outline" className="font-semibold">
							{item.urut}
						</Badge>
					</TableCell>
					<TableCell>
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
								<FileTypeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
							</div>
							<p className="font-semibold text-foreground">{item.name}</p>
						</div>
					</TableCell>
					<TableCell>
						<Badge variant="secondary" className="font-medium">
							<LayoutTemplateIcon className="h-3 w-3 mr-1.5" />
							{item.templateName}
						</Badge>
					</TableCell>
					<TableCell>
						{item.formulaPerformance ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-2 max-w-md">
										<p className="text-xs font-mono text-emerald-900 dark:text-emerald-100 truncate">
											{item.formulaPerformance}
										</p>
									</div>
								</TooltipTrigger>
								<TooltipContent className="max-w-md">
									<p className="font-mono text-xs whitespace-pre-wrap">{item.formulaPerformance}</p>
								</TooltipContent>
							</Tooltip>
						) : (
							<div className="bg-muted/50 border border-border rounded-md px-3 py-2">
								<span className="text-xs text-muted-foreground italic">Belum ada formula</span>
							</div>
						)}
					</TableCell>
					<TableCell>
						<ReportTypesTableActions row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
});
ReportTypesTableBody.displayName = "ReportTypesTableBody";

const ReportTypesTable = ({ page, setId, setShowDeleteDialog }: ReportTypesTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Report Types" />;
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<ReportTypesTableHeader />
				<ReportTypesTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
};

export default ReportTypesTable;
