import { Link, usePage } from "@inertiajs/react";
import { memo } from "react";
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
import { useSidebarConfig } from "@/hooks/use-sidebar";
import { dashboard } from "@/routes";
import type { SharedData, SidebarConfig } from "@/types";
import AppLogo from "./app-logo";
import NavMaster from "./nav-master";

const SidebarHeaderComponent = memo(() => (
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
));
SidebarHeaderComponent.displayName = "SidebarHeaderComponent";

interface SidebarContentProps {
	isAdmin: boolean;
	config: SidebarConfig;
}

const SidebarContentComponent = memo(({ isAdmin, config }: SidebarContentProps) => {
	const { mainItems, adminGroups, userGroups } = config;

	return (
		<SidebarContent>
			<NavMain items={mainItems} />
			{isAdmin && adminGroups.map((group) => (
				<NavMaster key={`admin-${group.title}`} group={group} />
			))}
			{userGroups.map((group) => (
				<NavMaster key={`user-${group.title}`} group={group} />
			))}
		</SidebarContent>
	);
});
SidebarContentComponent.displayName = "SidebarContentComponent";

const SidebarFooterComponent = memo(() => (
	<SidebarFooter>
		<NavUser />
	</SidebarFooter>
));
SidebarFooterComponent.displayName = "SidebarFooterComponent";

export function AppSidebar() {
	const { isAdmin } = usePage<SharedData>().props;
	const config = useSidebarConfig();
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeaderComponent />

			<SidebarContentComponent
				isAdmin={isAdmin}
				config={config}
			/>

			<SidebarFooterComponent />
		</Sidebar>
	);
}
