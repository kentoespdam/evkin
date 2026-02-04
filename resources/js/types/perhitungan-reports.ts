import type { Aspect } from "./aspect";
import type { Pagination } from "./index";
import type { Report } from "./report";
import type { ReportType } from "./report-type";

export interface PerhitunganReportFilters {
	report_type_id?: string;
	aspect_id?: string;
	year: number;
	month?: number;
	search?: string;
	per_page?: string;
}

export interface PerhitunganReportDetail {
	id: string;
	masterReport: Report;
	year: number;
	month: number;
	descIndicator: string;
	formula: string;
	formulaValue: string;
	nilai: number;
	nilaiIndicator: number;
	formulaNilaiBobot: string;
	nilaiBobot: number;
	formulaArchivement: string;
	formulaArchivementValue: string;
	nilaiArchivement: number;
}

export interface PerhitunganReportProps {
	masterReports: Report[];
	reportTypes: ReportType[];
	aspects: Aspect[];
	reports: PerhitunganReportDetail[];
	templateName: string;
	jenisReport?: ReportType;
	filters: PerhitunganReportFilters;
}

export interface PerhitunganReportsDetailProps {
	page: Pagination<PerhitunganReportDetail>;
	reportTypes: ReportType[];
	aspects: Aspect[];
	filters: PerhitunganReportFilters;
}
