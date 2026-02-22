import { Link } from "@inertiajs/react";
import {
	DatabaseIcon,
	FileInputIcon,
	PencilIcon,
	RulerIcon,
	SparklesIcon,
	TagIcon,
	TrashIcon,
	VariableIcon,
} from "lucide-react";
import { memo, useCallback } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import master from "@/routes/master";
import type { Pagination } from "@/types";
import type { MasterInput } from "@/types/master-input";

interface InputsTableProps {
	page: Pagination<MasterInput>;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}

const InputsTableHeader = memo(() => {
	return (
		<TableHeader>
			<TableRow className="bg-muted/50">
				<TableHead className="w-16 text-center font-semibold">#</TableHead>
				<TableHead className="w-24 text-center font-semibold">Aksi</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<SparklesIcon className="h-4 w-4 text-muted-foreground" />
						Aspek
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<TagIcon className="h-4 w-4 text-muted-foreground" />
						Kode
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<FileInputIcon className="h-4 w-4 text-muted-foreground" />
						Indikator
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<RulerIcon className="h-4 w-4 text-muted-foreground" />
						Satuan
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<DatabaseIcon className="h-4 w-4 text-muted-foreground" />
						Sumber Data
					</div>
				</TableHead>
				<TableHead className="font-semibold">
					<div className="flex items-center gap-2">
						<VariableIcon className="h-4 w-4 text-muted-foreground" />
						Formula
					</div>
				</TableHead>
			</TableRow>
		</TableHeader>
	);
});
InputsTableHeader.displayName = "InputsTableHeader";

const InputsTableBody = memo(({ page, setId, setShowDeleteDialog }: InputsTableProps) => {
	return (
		<TableBody>
			{page.data.map((item) => (
				<TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
					<TableCell className="w-16 text-center">
						<Badge variant="outline" className="font-semibold">
							{item.seq ?? 0}
						</Badge>
					</TableCell>
					<TableCell>
						<InputTableActions row={item} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
					</TableCell>
					<TableCell>
						{item.aspect ? (
							<Badge
								variant="secondary"
								className="capitalize bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-800"
							>
								<SparklesIcon className="h-3 w-3 mr-1.5" />
								{item.aspect.name}
							</Badge>
						) : (
							<span className="text-xs text-muted-foreground italic">-</span>
						)}
					</TableCell>
					<TableCell>
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
								<TagIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							</div>
							<p className="font-semibold text-foreground">{item.kode}</p>
						</div>
					</TableCell>
					<TableCell>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-2">
									<FileInputIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
									<p className="text-sm truncate max-w-xs">{item.description}</p>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs">{item.description}</p>
							</TooltipContent>
						</Tooltip>
					</TableCell>
					<TableCell>
						<Badge variant="outline" className="font-medium">
							<RulerIcon className="h-3 w-3 mr-1.5" />
							{item.satuan}
						</Badge>
					</TableCell>
					<TableCell>
						<Badge
							variant="secondary"
							className="capitalize bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
						>
							<DatabaseIcon className="h-3 w-3 mr-1.5" />
							{item.masterSource.name}
						</Badge>
					</TableCell>
					<TableCell>
						{item.formula ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-2">
										<VariableIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
										<code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-xs">
											{item.formula}
										</code>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<code className="text-xs font-mono max-w-xs break-all">{item.formula}</code>
								</TooltipContent>
							</Tooltip>
						) : (
							<span className="text-xs text-muted-foreground italic">-</span>
						)}
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	);
});
InputsTableBody.displayName = "InputsTableBody";

interface InputTableActionsProps {
	row: MasterInput;
	setId: (id: string) => void;
	setShowDeleteDialog: (show: boolean) => void;
}
const InputTableActions = memo(({ row, setId, setShowDeleteDialog }: InputTableActionsProps) => {
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
						<Link href={master.inputs.edit.url(row.id)}>
							<PencilIcon className="size-4" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Ubah Master Input</TooltipContent>
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
				<TooltipContent>Hapus Master Input</TooltipContent>
			</Tooltip>
		</div>
	);
});
InputTableActions.displayName = "InputTableActions";

const InputsTable = memo(({ page, setId, setShowDeleteDialog }: InputsTableProps) => {
	if (page.meta.total === 0) {
		return <TableEmpty tableName="Data Master Input" />;
	}
	return (
		<div className="overflow-x-auto">
			<Table>
				<InputsTableHeader />
				<InputsTableBody page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
			</Table>
		</div>
	);
});

InputsTable.displayName = "InputsTable";

export default InputsTable;
