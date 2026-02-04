import { memo } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Table } from "@/components/ui/table";
import { useRekapTahunanData, useYearRangeLaporanTahunan } from "@/hooks/use-rekap-tahunan";
import type { RekapTahunansProps } from "@/types/rekap-tahunan";
import { RekapInputTahunansTableBody } from "./input-tahunan-table-body";
import { RekapInputTahunansTableHeader } from "./input-tahunan-table-header";
import SectionHeaderRekapBuilder from "./section-header";

const RekapInputTahunansTable = memo(({ page, aspects, reportTypes, rekapData, filters }: RekapTahunansProps) => {
	const years = useYearRangeLaporanTahunan(filters.fromYear, filters.toYear);
	const { aspectDataMap, pageDataMap, rekapDataMap } = useRekapTahunanData(page, rekapData, aspects);

	if (page.data.length === 0) {
		return <TableEmpty tableName="Rekap Tahunan" />;
	}

	return (
		<div className="space-y-6">
			{reportTypes.map((reportType) => {
				const typeAspects = aspectDataMap.get(reportType.id) || [];
				if (typeAspects.length === 0) return null;

				return (
					<div key={reportType.id} className="overflow-hidden rounded-lg border">
						<Table>
							<SectionHeaderRekapBuilder title={reportType.name} colSpan={years.length + 4} />
							<RekapInputTahunansTableHeader years={years} />
							<RekapInputTahunansTableBody
								aspects={typeAspects}
								years={years}
								pageDataMap={pageDataMap}
								rekapDataMap={rekapDataMap}
							/>
						</Table>
					</div>
				);
			})}
		</div>
	);
});

RekapInputTahunansTable.displayName = "RekapInputTahunansTable";

export default RekapInputTahunansTable;
