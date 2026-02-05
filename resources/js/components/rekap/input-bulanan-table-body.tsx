import { Fragment, memo } from "react";
import { formatNumber } from "@/lib/math_parser";
import { cn, monthsList } from "@/lib/utils";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import { Badge } from "../ui/badge";
import { TableBody, TableCell, TableRow } from "../ui/table";
import AspectRowBuilder from "./aspect-row-builder";

interface BodyRowBuilderProps {
	pageData: MasterInput;
	rekapDataMap: Map<string, number>;
	year: number;
}
const BodyRow = memo(({ pageData, rekapDataMap, year }: BodyRowBuilderProps) => {
	const keyLastYear = `${pageData.id}-${year - 1}-12`;
	const nilaiLastYear = rekapDataMap.get(keyLastYear) || 0;
	const isFilledLastYear = nilaiLastYear > 0;
	return (
		<TableRow className="group hover:bg-muted/40">
			<TableCell className="border text-center">
				<Badge variant="outline" className="font-semibold">
					{pageData.seq}
				</Badge>
			</TableCell>
			<TableCell className="border">
				<div className="space-y-1">
					<p className="font-medium text-foreground">{pageData.description}</p>
					<p className="text-xs text-muted-foreground">Kode: {pageData.kode}</p>
				</div>
			</TableCell>
			<TableCell className="border">
				<Badge variant="outline">{pageData.masterSource?.name}</Badge>
			</TableCell>
			<TableCell className="border text-center">
				<Badge variant="secondary">{pageData.satuan}</Badge>
			</TableCell>
			{monthsList().map((month) => {
				const mapKey = `${pageData.id}-${year}-${month.value}`;
				const nilaiForMonth = rekapDataMap.get(mapKey) || 0;
				const isFilled = nilaiForMonth > 0;
				return (
					<TableCell
						key={month.value}
						className={cn("border text-center", {
							"text-right text-foreground": isFilled,
							"text-muted-foreground": !isFilled,
						})}
					>
						{isFilled ? formatNumber(nilaiForMonth) : "-"}
					</TableCell>
				);
			})}

			<TableCell
				className={cn("border text-center", {
					"text-right text-foreground": isFilledLastYear,
					"text-muted-foreground": !isFilledLastYear,
				})}
			>
				{isFilledLastYear ? formatNumber(nilaiLastYear) : "-"}
			</TableCell>
		</TableRow>
	);
});

BodyRow.displayName = "BodyRow";

interface RekapInputBulanansTableBodyProps {
	aspects: Aspect[];
	pageDataMap: Map<string, MasterInput[]>;
	rekapDataMap: Map<string, number>;
	year: number;
}

const RekapInputBulanansTableBody = memo(
	({ aspects, pageDataMap, rekapDataMap, year }: RekapInputBulanansTableBodyProps) => {
		return aspects.map((aspect) => {
			const pageData = pageDataMap.get(aspect.id) || [];
			if (pageData.length === 0) return null;
			return (
				<Fragment key={aspect.id}>
					<AspectRowBuilder aspect={aspect} colspan={17} />
					<TableBody>
						{pageData.map((item) => (
							<BodyRow key={item.id} pageData={item} rekapDataMap={rekapDataMap} year={year} />
						))}
					</TableBody>
				</Fragment>
			);
		});
	},
);
RekapInputBulanansTableBody.displayName = "RekapInputBulanansTableBody";

export default RekapInputBulanansTableBody;
