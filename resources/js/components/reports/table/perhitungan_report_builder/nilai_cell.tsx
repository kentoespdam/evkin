import { memo } from "react";
import { formatNumber, formatWithRuleValue } from "@/lib/math_parser";
import { cn } from "@/lib/utils";
import MonthCell from "./month_cell";

interface NilaiCellProps {
	value?: number;
	withRules?: boolean;
	rule?: string;
	precision?: number;
}

const NilaiCell = memo(({ value, withRules, rule, precision = 2 }: NilaiCellProps) => {
	const generateNilaiFormated = (val?: number) => {
		if (val === undefined || val === null) return null;
		if (val === 0) return "-";
		return formatNumber(val, precision);
	};

	if (!withRules) {
		return generateNilaiFormated(value);
	}

	if (!rule) return null;

	return formatWithRuleValue(rule, value);
});

NilaiCell.displayName = "NilaiCell";

export interface NilaiRowBuilderProps {
	monthValue: number;
	templateName: string;
	nilai?: number;
	nilaiIndicator?: number;
	nilaiBobot?: number;
	withRules?: boolean;
	rule?: string;
	precision?: number;
	isOddRow?: boolean;
	isLastYear?: boolean;
	className?: string;
}

const NilaiRowBuilder = memo(
	({
		monthValue,
		templateName,
		nilai,
		nilaiIndicator,
		nilaiBobot,
		withRules,
		rule,
		precision = 2,
		isOddRow = false,
		isLastYear = false,
		className,
	}: NilaiRowBuilderProps) => {
		const dangerIndicator = nilaiIndicator && nilaiIndicator <= 2 ? "text-destructive bg-red-200" : "";
		return (
			<>
				<MonthCell monthValue={monthValue} isOddRow={isOddRow} className={cn(className)} isLastYear={isLastYear}>
					<NilaiCell value={nilai} withRules={withRules} rule={rule} precision={2} />
				</MonthCell>
				<MonthCell
					monthValue={monthValue}
					isOddRow={isOddRow}
					className={cn("text-info font-bold", className, dangerIndicator)}
					isLastYear={isLastYear}
				>
					<NilaiCell value={nilaiIndicator} precision={precision} />
				</MonthCell>
				{templateName === "TEMPLATE_PUPR" && (
					<MonthCell monthValue={monthValue} isOddRow={isOddRow} className={cn(className)} isLastYear={isLastYear}>
						<NilaiCell value={nilaiBobot} precision={3} />
					</MonthCell>
				)}
			</>
		);
	},
);

NilaiRowBuilder.displayName = "NilaiRowBuilder";

export default NilaiRowBuilder;
