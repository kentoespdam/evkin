import { memo } from "react";
import PaginationNav from "@/components/commons/pagination-nav";
import TableEmpty from "@/components/commons/table-empty";
import { Table } from "@/components/ui/table";
import { useRekapBulananData } from "@/hooks/use-rekap-bulanan";
import { monthsList } from "@/lib/utils";
import type { RekapBulanansProps } from "@/types/transaksi-inputs";
import RekapInputBulanansTableBody from "./input-bulanan-table-body";
import RekapInputBulanansTableHeader from "./input-bulanan-table-header";
import SectionHeaderRekapBuilder from "./section-header";

const RekapInputBulanansTable = memo(
	({ page, aspects, reportTypes, rekapData, rekapTahunan, lockTransaksiInputs, filters }: RekapBulanansProps) => {
		const { aspectDataMap, pageDataMap, rekapDataMap } = useRekapBulananData(page, rekapData, aspects, rekapTahunan);

		if (page.meta.total === 0) {
			return <TableEmpty tableName="Rekap Bulanan" />;
		}

		return (
			<div className="space-y-6">
				{reportTypes.map((reportType) => {
					const typeAspects = aspectDataMap.get(reportType.id) || [];
					if (typeAspects.length === 0) return null;

					return (
						<div key={reportType.id} className="overflow-hidden rounded-lg border">
							<Table>
								<SectionHeaderRekapBuilder title={reportType.name} colSpan={monthsList().length + 5} />
								<RekapInputBulanansTableHeader lockTransaksiInputs={lockTransaksiInputs} year={filters.year} />
								<RekapInputBulanansTableBody
									aspects={typeAspects}
									pageDataMap={pageDataMap}
									rekapDataMap={rekapDataMap}
									year={filters.year}
								/>
							</Table>
						</div>
					);
				})}
				<PaginationNav page={page} />
			</div>
		);
	},
);

RekapInputBulanansTable.displayName = "RekapInputBulanansTable";

export default RekapInputBulanansTable;
