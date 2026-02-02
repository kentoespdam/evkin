import { router } from "@inertiajs/react";
import { LockIcon, LockOpenIcon } from "lucide-react";
import { Fragment, memo, useCallback, useMemo } from "react";
import { toast } from "sonner";
import PaginationNav from "@/components/commons/pagination-nav";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatNumber, monthsList } from "@/lib/utils";
import type { Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { LockTransaksiInput } from "@/types/lock-transaksi-input";
import type { RekapInputTahunan } from "@/types/rekap-tahunan";
import type { ReportType } from "@/types/report-type";
import type { TransaksiInput } from "@/types/transaksi-inputs";
import AspectRowBuilder from "./aspect-row-builder";
import SectionHeaderRekapBuilder from "./section-header";

const useGroupedData = (data: TransaksiInput[], aspectId: string, rekap: RekapInputTahunan[]) => {
	return useMemo(() => {
		const groupedRows = new Map<string, TransaksiInput[]>();
		const valuesByInputMonth = new Map<string, number>();
		const rekapMap = new Map<string, number>();

		data
			.filter((item) => item.masterInput?.aspect?.id === aspectId)
			.forEach((item) => {
				const inputId = item.masterInput?.id;
				if (!inputId) return;

				const existing = groupedRows.get(inputId) ?? [];
				groupedRows.set(inputId, [...existing, item]);

				// Cache nilai untuk performa
				valuesByInputMonth.set(`${item.id}-${inputId}-${item.month}`, item.nilai);
			});

		const rowItems = Array.from(groupedRows.values())
			.map((items) => items[0])
			.filter(Boolean);
		if (valuesByInputMonth.size > 0) {
			rekap.forEach((item) => {
				const kode = item.kode;
				const nilai = item.nilai;
				rekapMap.set(kode, nilai);
			});
		}
		return { rowItems, valuesByInputMonth, rekapMap };
	}, [data, aspectId, rekap]);
};

interface RekapInputBulanansTableProps {
	page: Pagination<TransaksiInput>;
	aspects: Aspect[];
	reportTypes: ReportType[];
	rekap: RekapInputTahunan[];
	lockTransaksiInputs: LockTransaksiInput[];
	year: number;
}

const RekapInputBulanansTableHeader = memo(
	({ lockTransaksiInputs, year }: { lockTransaksiInputs: LockTransaksiInput[]; year: number }) => {
		const handleToggleLock = useCallback(
			(month: number, isLocked: boolean) => {
				console.log({ month, isLocked, year });
				router.patch(
					`/transaksi/lock/${year}/${month}`,
					{ is_locked: !isLocked },
					{
						preserveScroll: true,
						onSuccess: () => {
							toast.success(!isLocked ? "Periode berhasil dikunci" : "Periode berhasil dibuka");
						},
						onError: (errors) => {
							toast.error(errors.message || "Gagal mengubah status lock");
						},
					},
				);
			},
			[year],
		);

		return (
			<TableHeader>
				<TableRow className="bg-muted/50">
					<TableHead className="w-16 border text-center font-semibold">#</TableHead>
					<TableHead className="min-w-[260px] border font-semibold">Indikator</TableHead>
					<TableHead className="min-w-[180px] border font-semibold">Sumber Data</TableHead>
					<TableHead className="w-24 border text-center font-semibold">Satuan</TableHead>
					{monthsList().map((month) => {
						const lock = lockTransaksiInputs.find((lock) => lock.month === month.value);
						const isLocked = lock?.isLocked ?? false;

						return (
							<TableHead key={month.value} className="border text-center font-semibold">
								<div className="flex items-center justify-center gap-2">
									<span>{month.label}</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 p-0"
										onClick={() => handleToggleLock(month.value, isLocked)}
										title={isLocked ? "Klik untuk membuka kunci" : "Klik untuk mengunci"}
									>
										{isLocked ? (
											<LockIcon className="h-3 w-3 text-red-500" />
										) : (
											<LockOpenIcon className="h-3 w-3 text-green-500" />
										)}
									</Button>
								</div>
							</TableHead>
						);
					})}
					<TableHead className="w-32 border text-center font-semibold">RATA-RATA / PENCAPAIAN</TableHead>
				</TableRow>
			</TableHeader>
		);
	},
);
RekapInputBulanansTableHeader.displayName = "RekapInputBulanansTableHeader";

interface BodyRowBuilderProps {
	item: TransaksiInput;
	months: number[];
	valuesByInputMonth: Map<string, number>;
	rekap: Map<string, number>;
}
const BodyRow = memo(({ item, months, valuesByInputMonth, rekap }: BodyRowBuilderProps) => {
	const itemId = item.id;
	const inputId = item.masterInput?.id ?? "";
	const itemKode = item.masterInput.kode ?? "";

	const nilaiRekap = rekap.get(itemKode);
	const isRekapFilled = nilaiRekap !== undefined && nilaiRekap !== 0;

	return (
		<TableRow className="group hover:bg-muted/40">
			<TableCell className="border text-center">
				<Badge variant="outline" className="font-semibold">
					{item.masterInput?.seq}
				</Badge>
			</TableCell>
			<TableCell className="border">
				<div className="space-y-1">
					<p className="font-medium text-foreground">{item.masterInput?.description}</p>
					<p className="text-xs text-muted-foreground">Kode: {item.masterInput?.kode}</p>
				</div>
			</TableCell>
			<TableCell className="border">
				<Badge variant="outline">{item.masterInput.masterSource?.name}</Badge>
			</TableCell>
			<TableCell className="border text-center">
				<Badge variant="secondary">{item.masterInput?.satuan}</Badge>
			</TableCell>
			{months.map((month) => {
				const nilaiForMonth = valuesByInputMonth.get(`${itemId}-${inputId}-${month}`);
				const isFilled = nilaiForMonth !== undefined && nilaiForMonth !== 0;

				return (
					<TableCell
						key={month}
						className={cn("border text-center", {
							"text-right text-foreground": isFilled,
							"text-muted-foreground": !isFilled,
						})}
					>
						{isFilled ? formatNumber(nilaiForMonth) : "-"}
					</TableCell>
				);
			})}
			<TableCell className="border text-right">
				<span className="font-medium text-foreground">{isRekapFilled ? formatNumber(nilaiRekap) : "-"}</span>
			</TableCell>
		</TableRow>
	);
});

BodyRow.displayName = "BodyRow";

interface BodyBuilderProps {
	aspect: Aspect;
	page: Pagination<TransaksiInput>;
	rekap: RekapInputTahunan[];
}
const BodyBuilder = memo(({ aspect, page, rekap }: BodyBuilderProps) => {
	const months = monthsList().map((m) => m.value);
	const { rowItems, valuesByInputMonth, rekapMap } = useGroupedData(page.data, aspect.id, rekap);

	if (rowItems.length === 0) {
		return null;
	}

	return (
		<TableBody>
			{rowItems.map((item) => (
				<BodyRow key={item.id} item={item} months={months} valuesByInputMonth={valuesByInputMonth} rekap={rekapMap} />
			))}
		</TableBody>
	);
});
BodyBuilder.displayName = "BodyBuilder";

interface RekapInputBulanansTableBodyProps {
	page: Pagination<TransaksiInput>;
	reportType: ReportType;
	aspects: Aspect[];
	rekap: RekapInputTahunan[];
}

const RekapInputBulanansTableBody = memo(({ page, reportType, aspects, rekap }: RekapInputBulanansTableBodyProps) => {
	const aspectRows = useMemo(() => {
		return aspects.filter((aspect) => aspect.reportType.id === reportType.id);
	}, [reportType, aspects]);

	if (aspectRows.length === 0) {
		return null;
	}

	return aspectRows.map((aspect) => (
		<Fragment key={aspect.id}>
			<AspectRowBuilder aspect={aspect} colspan={monthsList().length + 5} />
			<BodyBuilder aspect={aspect} page={page} rekap={rekap} />
		</Fragment>
	));
});
RekapInputBulanansTableBody.displayName = "RekapInputBulanansTableBody";

const RekapInputBulanansTable = ({
	page,
	aspects,
	reportTypes,
	rekap,
	lockTransaksiInputs,
	year,
}: RekapInputBulanansTableProps) => {
	if (page.data.length === 0) {
		return <TableEmpty tableName="Rekap Bulanan" />;
	}

	return (
		<div className="space-y-6">
			{reportTypes.map((reportType) => (
				<div key={reportType.id} className="overflow-hidden rounded-lg border">
					<Table>
						<SectionHeaderRekapBuilder title={reportType.name} colSpan={monthsList().length + 5} />
						<RekapInputBulanansTableHeader lockTransaksiInputs={lockTransaksiInputs} year={year} />
						<RekapInputBulanansTableBody page={page} reportType={reportType} aspects={aspects} rekap={rekap} />
					</Table>
				</div>
			))}
			<PaginationNav page={page} />
		</div>
	);
};

export default RekapInputBulanansTable;
