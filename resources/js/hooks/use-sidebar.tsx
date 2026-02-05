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
				title: "Dashboard",
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
				title: "Master Data",
				items: [
					{
						title: "Roles",
						href: master.roles().url,
						icon: MemoizedIcons.Network,
					},
					{
						title: "Users",
						href: master.users().url,
						icon: MemoizedIcons.Users2,
					},
					{
						title: "Sumber Data",
						href: master.sources().url,
						icon: MemoizedIcons.GitPullRequestArrow,
					},
					{
						title: "Master Inputs",
						href: master.inputs().url,
						icon: MemoizedIcons.TextCursorInputIcon,
					},
					{
						title: "Role Inputs",
						href: master.roleInputs().url,
						icon: MemoizedIcons.KeyIcon,
					},
					{
						title: "Report Types",
						href: master.reportTypes().url,
						icon: MemoizedIcons.FileTypeIcon,
					},
					{
						title: "Aspects",
						href: master.aspects().url,
						icon: MemoizedIcons.GroupIcon,
					},
					{
						title: "Reports",
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
						title: "Laporan Perhitungan Detail",
						href: report.perhitunganReports.detail().url,
						icon: MemoizedIcons.FileCodeIcon,
					},
					{
						title: "Laporan Perhitungan",
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
