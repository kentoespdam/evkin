import type { MasterInput } from "./master-input";
import type { Role } from "./role";
import type { TransaksiInput } from "./transaksi-inputs";

export interface RoleInput {
	id: string;
	role: Role;
	masterInput: MasterInput;
}

export interface RoleInputWithTransaksiInput extends RoleInput {
	transaksiInputs: TransaksiInput[];
}
