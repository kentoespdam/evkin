import { Fragment, memo } from "react";
import { formatNumber } from "@/lib/math_parser";
import { cn, monthsList } from "@/lib/utils";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import { Badge } from "../ui/badge";
import { TableBody, TableCell, TableRow } from "../ui/table";
import AspectRowBuilder from "./aspect-row-builder";

interface BodyRowBuilderProps {
	masterInput: MasterInput;
	rekapDataMap: Map<string, number>;
	rekapTahunan?: number;
	year: number;
}
const BodyRow = memo(({ masterInput, rekapDataMap, rekapTahunan, year }: BodyRowBuilderProps) => {
	const masterInputId = masterInput.id;
	return (
		<TableRow className="group hover:bg-muted/40">
			<TableCell className="border text-center">
				<Badge variant="outline" className="font-semibold">
					{masterInput.seq}
				</Badge>
			</TableCell>
			<TableCell className="border">
				<div className="space-y-1">
					<p className="font-medium text-foreground">{masterInput.description}</p>
					<p className="text-xs text-muted-foreground">Kode: {masterInput.kode}</p>
				</div>
			</TableCell>
			<TableCell className="border">
				<Badge variant="outline">{masterInput.masterSource?.name}</Badge>
			</TableCell>
			<TableCell className="border text-center">
				<Badge variant="secondary">{masterInput.satuan}</Badge>
			</TableCell>
			{monthsList().map((month) => {
				const mapKey = `${masterInputId}-${year}-${month.value}`;
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
					"text-right text-foreground": rekapTahunan,
					"text-muted-foreground": !rekapTahunan,
				})}
			>
				{rekapTahunan ? formatNumber(rekapTahunan) : "-"}
			</TableCell>
		</TableRow>
	);
});

BodyRow.displayName = "BodyRow";

interface RekapInputBulanansTableBodyProps {
	aspects: Aspect[];
	pageDataMap: Map<string, MasterInput[]>;
	rekapDataMap: Map<string, number>;
	rekapTahunanMap: Map<string, number>;
	year: number;
}

const RekapInputBulanansTableBody = memo(
	({ aspects, pageDataMap, rekapDataMap, rekapTahunanMap, year }: RekapInputBulanansTableBodyProps) => {
		return aspects.map((aspect) => {
			const pageData = pageDataMap.get(aspect.id) || [];
			if (pageData.length === 0) return null;
			return (
				<Fragment key={aspect.id}>
					<AspectRowBuilder aspect={aspect} colspan={17} />
					<TableBody>
						{pageData.map((item) => {
							const rekapTahunan = rekapTahunanMap.get(item.id);
							return (
								<BodyRow
									key={item.id}
									masterInput={item}
									rekapDataMap={rekapDataMap}
									rekapTahunan={rekapTahunan}
									year={year}
								/>
							);
						})}
					</TableBody>
				</Fragment>
			);
		});
	},
);
RekapInputBulanansTableBody.displayName = "RekapInputBulanansTableBody";

export default RekapInputBulanansTableBody;
