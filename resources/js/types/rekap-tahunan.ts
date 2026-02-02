import type { MasterInput } from "./master-input";
import type { MasterSource } from "./master-source";

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

export interface RekapInputTahunanFilters {
	fromYear: number;
	toYear: number;
	search?: string;
}

export interface RekapBulananFilters {
	year: number;
	search?: string;
}
