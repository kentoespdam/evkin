import type { Aspect } from "./aspect";
import type { ReportType } from "./report-types";

export interface Report {
	id: string;
	urut: number;
	reportType: ReportType;
	aspect: Aspect;
	descIndicator: string;
	descFormula: string;
	unit: string;
	weight: number;
	formula: string;
}
