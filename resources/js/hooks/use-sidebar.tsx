import {
	FileClockIcon,
	FileCodeIcon,
	FileDigitIcon,
	FileInputIcon,
	FileTextIcon,
	FileTypeIcon,
	GitPullRequestArrow,
	GroupIcon,
	KeyIcon,
	LayoutGrid,
	Network,
	TextCursorInputIcon,
	Users2,
} from "lucide-react";
import { memo, useMemo } from "react";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import rekap from "@/routes/rekap";
import report from "@/routes/report";
import transaksi from "@/routes/transaksi";
import type { NavGroup, NavItem, SidebarConfig } from "@/types";

export const MemoizedIcons = {
	LayoutGrid: memo(LayoutGrid),
	FileInputIcon: memo(FileInputIcon),
	Network: memo(Network),
	Users2: memo(Users2),
	GitPullRequestArrow: memo(GitPullRequestArrow),
	TextCursorInputIcon: memo(TextCursorInputIcon),
	KeyIcon: memo(KeyIcon),
	FileTypeIcon: memo(FileTypeIcon),
	GroupIcon: memo(GroupIcon),
	FileTextIcon: memo(FileTextIcon),
	FileCodeIcon: memo(FileCodeIcon),
	FileDigitIcon: memo(FileDigitIcon),
	FileClockIcon: memo(FileClockIcon),
};

export const useSidebarConfig = (): SidebarConfig => {
	return useMemo(() => {
		const mainItems: NavItem[] = [
			{
				title: "Beranda",
				href: dashboard(),
				icon: MemoizedIcons.LayoutGrid,
			},
			{
				title: "Input Transaksi",
				href: transaksi.inputs().url,
				icon: MemoizedIcons.FileInputIcon,
			},
		];

		const adminGroups: NavGroup[] = [
			{
				title: "Data Master",
				items: [
					{
						title: "Peran",
						href: master.roles().url,
						icon: MemoizedIcons.Network,
					},
					{
						title: "Pengguna",
						href: master.users().url,
						icon: MemoizedIcons.Users2,
					},
					{
						title: "Sumber Data",
						href: master.sources().url,
						icon: MemoizedIcons.GitPullRequestArrow,
					},
					{
						title: "Master Input",
						href: master.inputs().url,
						icon: MemoizedIcons.TextCursorInputIcon,
					},
					{
						title: "Peran Indikator",
						href: master.roleInputs().url,
						icon: MemoizedIcons.KeyIcon,
					},
					{
						title: "Tipe Laporan",
						href: master.reportTypes().url,
						icon: MemoizedIcons.FileTypeIcon,
					},
					{
						title: "Aspek",
						href: master.aspects().url,
						icon: MemoizedIcons.GroupIcon,
					},
					{
						title: "Laporan",
						href: master.reports().url,
						icon: MemoizedIcons.FileTextIcon,
					},
				],
			},
		];

		const userGroups: NavGroup[] = [
			{
				title: "Laporan",
				items: [
					{
						title: "Detail Perhitungan",
						href: report.perhitunganReports.detail().url,
						icon: MemoizedIcons.FileCodeIcon,
					},
					{
						title: "Perhitungan",
						href: report.perhitunganReports().url,
						icon: MemoizedIcons.FileDigitIcon,
					},
				],
			},
			{
				title: "Rekapitulasi",
				items: [
					{
						title: "Rekap Bulanan",
						href: rekap.rekapBulanan().url,
						icon: MemoizedIcons.FileClockIcon,
					},
					{
						title: "Rekap Tahunan",
						href: rekap.rekapTahunan().url,
						icon: MemoizedIcons.FileClockIcon,
					},
				],
			},
		];

		return { mainItems, adminGroups, userGroups };
	}, []);
};
