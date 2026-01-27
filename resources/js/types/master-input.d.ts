import type { MasterSource } from "./master-source";

export interface MasterInput {
	id: string;
	seq?: number;
	urut: number;
	kode: string;
	description: string;
	satuan: string;
	masterSource: MasterSource;
}
