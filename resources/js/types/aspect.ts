import type { ReportType } from "@/types/report-type";
export interface Aspect {
	id: string;
	name: string;
	formulaAspect?: string | null;
	reportType: ReportType;
}
