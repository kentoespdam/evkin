import type { Pagination } from ".";
import type { Aspect } from "./aspect";
import type { LockTransaksiInput } from "./lock-transaksi-input";
import type { MasterInput } from "./master-input";
import type { RekapBulananFilters, RekapInputTahunan } from "./rekap-tahunan";
import type { ReportType } from "./report-type";

export interface TransaksiInput {
	id: string;
	year: number;
	month: number;
	masterInput: MasterInput;
	nilai: number;
	isLocked: boolean;
}

export interface RekapBulanansProps {
	page: Pagination<MasterInput>;
	aspects: Aspect[];
	reportTypes: ReportType[];
	rekapData: TransaksiInput[];
	rekapTahunan: RekapInputTahunan[];
	lockTransaksiInputs: LockTransaksiInput[];
	filters: RekapBulananFilters;
}

export interface TransaksiInputFilter {
	year: string;
	month: string;
	search: string;
}

export interface RekapInputBulanansTableProps {
	page: Pagination<MasterInput>;
	aspects: Aspect[];
	reportTypes: ReportType[];
	rekapData: TransaksiInput[];
	rekapTahunan: RekapInputTahunan[];
	lockTransaksiInputs: LockTransaksiInput[];
	year: number;
}
