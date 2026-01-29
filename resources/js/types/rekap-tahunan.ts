import type { MasterSource } from "./master-source";

export interface RekapInputTahunan {
	id: string;
	seq: number;
	kode: string;
	description: string;
	satuan: string;
	masterSource: MasterSource;
	periode: string;
	year: number;
	month: number;
	nilai: number;
}

export interface RekapInputTahunanFilters {
	fromYear?: number;
	toYear?: number;
	search?: string;
}
