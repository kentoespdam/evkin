import { InfoIcon } from "lucide-react";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const FormulaIndicatorTooltip = memo(() => {
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<InfoIcon className="ml-1 h-4 w-4 text-primary cursor-help hover:text-primary/80 transition-colors" />
				</TooltipTrigger>
				<TooltipContent className="text-primary-foreground shadow-lg border border-primary/20 max-w-xs">
					<div className="space-y-2">
						<p className="font-semibold text-xs">Operator yang tersedia:</p>
						<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
							<span>GTE : ≥ (Greater/Equal)</span>
							<span>LTE : ≤ (Less/Equal)</span>
							<span>GT : &gt; (Greater Than)</span>
							<span>LT : &lt; (Less Than)</span>
							<span>EQ : == (Equal)</span>
							<span>NEQ : != (Not Equal)</span>
						</div>
						<p className="font-semibold text-xs mt-2">Contoh:</p>
						<p className="text-xs text-primary-foreground/80">
							LTE 3 = 1;
							<br />
							LTE 6 = 2;
							<br />
							LTE 9 = 3;
							<br />
							LTE 12 = 4;
							<br />
							GT 12 = 5;
							<br />
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
});
FormulaIndicatorTooltip.displayName = "FormulaIndicatorTooltip";

export default FormulaIndicatorTooltip;
