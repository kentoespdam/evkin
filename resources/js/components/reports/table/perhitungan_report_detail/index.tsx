import { memo, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { formatFormulaValue, formatNumber } from "@/lib/math_parser";
import type { Pagination } from "@/types";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";

interface PerhitunganReportsTableProps {
	page: Pagination<PerhitunganReportDetail>;
	filters?: {
		year: number;
		month: number;
		report_type_id?: string;
		aspect_id?: string;
		search?: string;
	};
}

const PerhitunganReportsDetailTableHeader = memo(() => (
	<TableHeader>
		<TableRow>
			<TableCell>#</TableCell>
			<TableCell>Periode</TableCell>
			<TableCell>Indikator</TableCell>
			<TableCell>Rumus</TableCell>
			<TableCell>Rumus Value</TableCell>
			<TableCell>Satuan</TableCell>
			<TableCell>Nilai</TableCell>
			<TableCell>Nilai Indikator</TableCell>
			<TableCell>Rumus Bobot</TableCell>
			<TableCell>Nilai Bobot</TableCell>
			<TableCell>Rumus Pencapaian</TableCell>
			<TableCell>Rumus Pencapaian</TableCell>
			<TableCell>Nilai Pencapaian</TableCell>
		</TableRow>
	</TableHeader>
));
PerhitunganReportsDetailTableHeader.displayName = "PerhitunganReportsDetailTableHeader";

const RulesBadge = memo(({ rule }: { rule: string }) => {
	const rules = rule?.split("\n").filter((item) => item.trim()) || [];

	if (rules.length === 0) return null;

	return (
		<div className="mt-2 bg-slate-100 text-slate-900 rounded px-3 py-2 border border-slate-300 font-mono text-xs">
			<div className="mb-2 font-semibold">Rules:</div>
			<div>
				{rules.map((item, index) => {
					const isLast = index === rules.length - 1;
					const prefix = isLast ? "└── " : "├── ";
					return (
						<div key={item}>
							{prefix}
							{item}
						</div>
					);
				})}
			</div>
		</div>
	);
});
RulesBadge.displayName = "RulesBadge";

const RumusCell = memo(({ item }: { item: PerhitunganReportDetail }) => {
	return (
		<TableCell>
			<div className="whitespace-nowrap">
				{item.formula}
				{item.masterReport.withRules && (
					<RulesBadge rule={item.masterReport.rules || ""} />
				)}
			</div>
		</TableCell>
	);
});
RumusCell.displayName = "RumusCell";

interface ReportTableRowProps {
	row: PerhitunganReportDetail & {
		urut: number;
		bobotDigits: number;
		archivementDigits: number
	};
}
const ReportTableRow = memo(({ row }: ReportTableRowProps) => (
	<TableRow key={row.id}>
		<TableCell>{row.urut}</TableCell>
		<TableCell>{`${row.year}-${row.month}`}</TableCell>
		<TableCell>{row.descIndicator}</TableCell>
		<RumusCell item={row} />
		<TableCell>{formatFormulaValue(row.formulaValue)}</TableCell>
		<TableCell>{row.masterReport?.unit}</TableCell>
		<TableCell align="right">{formatNumber(row.nilai, 2)}</TableCell>
		<TableCell align="right">{formatNumber(row.nilaiIndicator)}</TableCell>
		<TableCell>{formatFormulaValue(row.formulaNilaiBobot, 3)}</TableCell>
		<TableCell align="right">{formatNumber(row.nilaiBobot, row.bobotDigits)}</TableCell>
		<TableCell>{row.formulaArchivement}</TableCell>
		<TableCell>{formatFormulaValue(row.formulaArchivementValue)}</TableCell>
		<TableCell align="right">{formatNumber(row.nilaiArchivement, row.archivementDigits)}</TableCell>
	</TableRow>
));
ReportTableRow.displayName = "ReportTableRow";

const PerhitunganReportsDetailTableBody = memo(({ page }:
	{ page: Pagination<PerhitunganReportDetail> }) => {
	const rows = useMemo(() => {
		const firstNumber = page.meta.from;
		return page.data.map((item, index) => ({
			urut: firstNumber + index,
			bobotDigits: item.nilaiBobot > 0 ? 3 : 0,
			archivementDigits: item.nilaiArchivement > 0 ? 2 : 0,
			...item,
		}));
	}, [page]);
	return (
		<TableBody>
			{rows.map((row) => (
				<ReportTableRow key={row.id} row={row} />
			))}
		</TableBody>
	);
});
PerhitunganReportsDetailTableBody.displayName = "PerhitunganReportsDetailTableBody";

const PerhitunganReportsDetailTable = ({ page }: PerhitunganReportsTableProps) => {
	return (
		<Table>
			<PerhitunganReportsDetailTableHeader />
			<PerhitunganReportsDetailTableBody page={page} />
		</Table>
	);
};
export default PerhitunganReportsDetailTable;
