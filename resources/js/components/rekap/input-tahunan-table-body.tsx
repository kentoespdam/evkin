import { Fragment, memo } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/math_parser";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import AspectRowBuilder from "./aspect-row-builder";

interface BodyRowProps {
	pageData: MasterInput;
	rekapDataMap: Map<string, number>;
	years: number[];
}

const BodyRow = memo(({ pageData, rekapDataMap, years }: BodyRowProps) => (
	<TableRow className="hover:bg-muted/50">
		<TableCell className="border text-center">{pageData.seq}</TableCell>
		<TableCell className="border">{pageData.description}</TableCell>
		<TableCell className="border">{pageData.masterSource.name}</TableCell>
		<TableCell className="border">{pageData.satuan}</TableCell>
		{years.map((year) => {
			const mapKey = `${pageData.id}-${year}`;
			const rekapItem = rekapDataMap.get(mapKey);
			return (
				<TableCell key={mapKey} className="border" align="right">
					{rekapItem ? formatNumber(rekapItem, 2) : "-"}
				</TableCell>
			);
		})}
	</TableRow>
));
BodyRow.displayName = "BodyRow";

interface RekapInputTahunansTableBodyProps {
	aspects: Aspect[];
	pageDataMap: Map<string, MasterInput[]>;
	rekapDataMap: Map<string, number>;
	years: number[];
}

export const RekapInputTahunansTableBody = memo(
	({ pageDataMap, aspects, years, rekapDataMap }: RekapInputTahunansTableBodyProps) => (
		<>
			{aspects.map((aspect) => {
				const pageData = pageDataMap.get(aspect.id) || [];
				if (pageData.length === 0) return null;

				return (
					<Fragment key={aspect.id}>
						<AspectRowBuilder aspect={aspect} colspan={years.length + 4} />
						<TableBody>
							{pageData.map((item) => (
								<BodyRow key={item.id} pageData={item} rekapDataMap={rekapDataMap} years={years} />
							))}
						</TableBody>
					</Fragment>
				);
			})}
		</>
	),
);

RekapInputTahunansTableBody.displayName = "RekapInputTahunansTableBody";
