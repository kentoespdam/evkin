import { memo } from "react";
import { TableFooter, TableHead, TableRow } from "@/components/ui/table";
import { BORDER_CLASS } from "@/lib/component_helper";
import { totalKinerjaToKinerja } from "@/lib/math_parser";
import { cn, type MonthOption } from "@/lib/utils";
import MonthCell from "./month_cell";
import NilaiRowBuilder from "./nilai_cell";

interface TotalFooterProps {
	months: MonthOption[];
	year: number;
	totalKinerjaByMonth: Map<string, number>;
	totalBobotByMonth: Map<string, number>;
	templateName: string;
	formulaPerformance?: string | null;
	showUnitColumn?: boolean;
	showFormulaColumn?: boolean;
}

const TemplateKepmendagri = memo(
	({
		months,
		year,
		totalKinerjaByMonth,
		templateName,
		formulaPerformance,
		showUnitColumn = true,
		showFormulaColumn = true,
	}: Omit<TotalFooterProps, "totalBobotByMonth">) => {
		const colSpanBase = 3 + (showUnitColumn ? 1 : 0) + (showFormulaColumn ? 1 : 0);

		return (
			<TableFooter>
				<TableRow>
					<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase}>
						NILAI KINERJA TOTAL
					</TableHead>
					{months.map((month) => {
						const totalId = `${year}-${month.value}`;
						const totalKinerja = totalKinerjaByMonth.get(totalId);
						return (
							<NilaiRowBuilder
								key={`total-kinerja-${month.value}`}
								monthValue={month.value}
								nilaiIndicator={totalKinerja}
								className="text-xl"
								precision={0}
								templateName={templateName}
							/>
						);
					})}
					<NilaiRowBuilder
						monthValue={13}
						nilaiIndicator={totalKinerjaByMonth.get(`${year - 1}-12`)}
						className="text-xl"
						precision={0}
						templateName={templateName}
					/>
				</TableRow>

				<TableRow>
					<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase}>
						KINERJA
					</TableHead>
					{months.map((month) => {
						const totalId = `${year}-${month.value}`;
						const totalKinerja = totalKinerjaByMonth.get(totalId);
						return (
							<MonthCell
								key={`kinerja-text-${month.value}`}
								monthValue={month.value}
								colSpan={2}
								isOddRow={true}
								className="font-bold text-info text-xl"
							>
								{totalKinerjaToKinerja(totalKinerja, formulaPerformance)}
							</MonthCell>
						);
					})}
					<MonthCell monthValue={12} isLastYear colSpan={2} className="font-bold text-info text-xl">
						{totalKinerjaToKinerja(totalKinerjaByMonth.get(`${year - 1}-12`), formulaPerformance)}
					</MonthCell>
				</TableRow>
			</TableFooter>
		);
	},
);
TemplateKepmendagri.displayName = "TemplateKepmendagri";

const TemplatePupr = memo(
	({
		months,
		year,
		totalBobotByMonth,
		templateName,
		formulaPerformance,
		showUnitColumn = true,
		showFormulaColumn = true,
	}: Omit<TotalFooterProps, "totalKinerjaByMonth">) => {
		const colSpanBase = 3 + (showUnitColumn ? 1 : 0) + (showFormulaColumn ? 1 : 0);

		return (
			<TableFooter>
				<TableRow>
					<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase}>
						NILAI KINERJA TOTAL
					</TableHead>
					{months.map((month) => {
						const totalId = `${year}-${month.value}`;
						const nilaiBobot = totalBobotByMonth.get(totalId);
						return (
							<NilaiRowBuilder
								key={`total-kinerja-${month.value}`}
								monthValue={month.value}
								nilaiBobot={nilaiBobot}
								className="font-bold text-info text-md"
								precision={0}
								templateName={templateName}
							/>
						);
					})}
					<NilaiRowBuilder
						monthValue={13}
						nilaiBobot={totalBobotByMonth.get(`${year - 1}-12`)}
						className="font-bold text-info text-md"
						precision={0}
						templateName={templateName}
					/>
				</TableRow>

				<TableRow>
					<TableHead className={cn("pl-12", BORDER_CLASS)} colSpan={colSpanBase}>
						KINERJA
					</TableHead>
					{months.map((month) => {
						const totalId = `${year}-${month.value}`;
						const nilaiBobot = totalBobotByMonth.get(totalId);
						return (
							<MonthCell
								key={`kinerja-text-${month.value}`}
								monthValue={month.value}
								colSpan={3}
								isOddRow={true}
								className="font-bold text-info text-md"
							>
								{totalKinerjaToKinerja(nilaiBobot, formulaPerformance)}
							</MonthCell>
						);
					})}
					<MonthCell monthValue={12} isLastYear colSpan={3} className="font-bold text-info text-md">
						{totalKinerjaToKinerja(totalBobotByMonth.get(`${year - 1}-12`), formulaPerformance)}
					</MonthCell>
				</TableRow>
			</TableFooter>
		);
	},
);

TemplatePupr.displayName = "TemplatePupr";

const TotalFooter = memo((props: TotalFooterProps) => {
	return props.templateName === "TEMPLATE_KEPMENDAGRI" ? (
		<TemplateKepmendagri {...props} />
	) : (
		<TemplatePupr {...props} />
	);
});

TotalFooter.displayName = "TotalFooter";

export default TotalFooter;
