import type { MasterInput } from "./master-input";

export interface TransaksiInput {
	id: string;
	year: number;
	month: number;
	masterInput: MasterInput;
	nilai: number;
}

export interface TransaksiInputFilter {
	year: string;
	month: string;
	search: string;
}
