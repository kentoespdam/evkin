import type { ReportType } from "@/types/report-type";
export interface Aspect {
	id: string;
	name: string;
	maxScore?: number | null;
	weight?: number | null;
	reportType: ReportType;
}
