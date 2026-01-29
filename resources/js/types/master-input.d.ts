import type { Aspect } from "./aspect";
import type { MasterSource } from "./master-source";

export interface MasterInput {
	id: string;
	seq?: number;
	urut: number;
	aspect?: Aspect | null;
	kode: string;
	description: string;
	satuan: string;
	masterSource: MasterSource;
	formula?: string | null;
}

export interface MasterInputFilters {
	search?: string;
	aspect_id?: string;
}
