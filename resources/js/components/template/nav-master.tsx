import { Link, usePage } from "@inertiajs/react";
import { type FC, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { resolveUrl } from "@/lib/utils";
import type { NavGroup } from "@/types";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface NavMasterProps {
	group: NavGroup;
}

const NavMaster: FC<NavMasterProps> = ({ group }) => {
	const { url } = usePage();

	const currentPath = useMemo(() => url.split("?")[0], [url]);

	return (
		<SidebarGroup className="px-2 py-0">
			<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
			<SidebarMenu>
				{group.items.map((item) => {
					const isActive = currentPath === resolveUrl(item.href);

					return (
						<SidebarMenuItem key={uuidv4()}>
							<SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
								<Link href={item.href} prefetch>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default NavMaster;
