import type { Pagination } from ".";
import type { Aspect } from "./aspect";
import type { MasterInput } from "./master-input";
import type { MasterSource } from "./master-source";
import type { ReportType } from "./report-type";

export interface RekapInputTahunan {
	id: string;
	seq: number;
	kode: string;
	description: string;
	satuan: string;
	masterSource: MasterSource;
	masterInput?: MasterInput | null;
	periode: string;
	year: number;
	month: number;
	nilai: number;
}

export interface RekapTahunansProps {
	page: Pagination<MasterInput>;
	aspects: Aspect[];
	reportTypes: ReportType[];
	rekapData: RekapInputTahunan[];
	filters: RekapInputTahunanFilters;
}

export interface RekapInputTahunanFilters {
	fromYear: number;
	toYear: number;
	search?: string;
}

export interface RekapTahunansFiltersProps {
	filters: RekapInputTahunanFilters;
	onFilterChange: (key: string, value: string) => void;
	onReset: () => void;
	years: number[];
}

export interface RekapBulananFilters {
	year: number;
	search?: string;
}
