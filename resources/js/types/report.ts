import type { Aspect } from "./aspect";
import type { ReportType } from "./report-type";

export interface Report {
	id: string;
	seq: number;
	urut: number;
	reportType: ReportType;
	aspect: Aspect;
	descIndicator: string;
	descFormula: string;
	unit: string;
	weight: number;
	formula: string;
	formulaIndicator: string;
	formulaArchivement: string;
	withRules: boolean;
	rules: string | null;
}

export interface ReportFilters {
	search?: string;
	reportTypeId?: string;
	aspectId?: string;
}
