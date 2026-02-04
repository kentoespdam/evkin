import { Link, usePage } from "@inertiajs/react";
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
import { NavMain } from "@/components/template/nav-main";
import { NavUser } from "@/components/template/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import rekap from "@/routes/rekap";
import report from "@/routes/report";
import transaksi from "@/routes/transaksi";
import type { NavGroup, NavItem, SharedData } from "@/types";
import AppLogo from "./app-logo";
import NavMaster from "./nav-master";

const mainNavItems: NavItem[] = [
	{
		title: "Dashboard",
		href: dashboard(),
		icon: LayoutGrid,
	},
	{
		title: "Input Transaksi",
		href: transaksi.inputs().url,
		icon: FileInputIcon,
	},
];

const masterGroupItems: NavGroup = {
	title: "Master Data",
	items: [
		{
			title: "Roles",
			href: master.roles().url,
			icon: Network,
		},
		{
			title: "Users",
			href: master.users().url,
			icon: Users2,
		},
		{
			title: "Sumber Data",
			href: master.sources().url,
			icon: GitPullRequestArrow,
		},
		{
			title: "Master Inputs",
			href: master.inputs().url,
			icon: TextCursorInputIcon,
		},
		{
			title: "Role Inputs",
			href: master.roleInputs().url,
			icon: KeyIcon,
		},
		{
			title: "Report Types",
			href: master.reportTypes().url,
			icon: FileTypeIcon,
		},
		{
			title: "Aspects",
			href: master.aspects().url,
			icon: GroupIcon,
		},
		{
			title: "Reports",
			href: master.reports().url,
			icon: FileTextIcon,
		},
	],
};

const reportGroupItems: NavGroup = {
	title: "Laporan",
	items: [
		{
			title: "Laporan Perhitungan Detail",
			href: report.perhitunganReports.detail().url,
			icon: FileCodeIcon,
		},
		{
			title: "Laporan Perhitungan",
			href: report.perhitunganReports().url,
			icon: FileDigitIcon,
		},
	],
};

const rekapGroupItems: NavGroup = {
	title: "Rekapitulasi",
	items: [
		{
			title: "Rekap Bulanan",
			href: rekap.rekapBulanan().url,
			icon: FileClockIcon,
		},
		{
			title: "Rekap Tahunan",
			href: rekap.rekapTahunan().url,
			icon: FileClockIcon,
		},
	],
};

export function AppSidebar() {
	const { isAdmin } = usePage<SharedData>().props;
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href={dashboard()} prefetch>
								<AppLogo />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={mainNavItems} />
				{isAdmin && <NavMaster group={masterGroupItems} />}
				<NavMaster group={reportGroupItems} />
				<NavMaster group={rekapGroupItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
