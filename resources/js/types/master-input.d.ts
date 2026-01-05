import type { MasterSource } from "./master-source";

export interface MasterInput {
	id: string;
	kode: string;
	description: string;
	satuan: string;
	masterSource: MasterSource;
}
