import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
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
import { NavGroup, type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import { LayoutGrid, Network, Users2 } from "lucide-react";
import AppLogo from "./app-logo";
import NavMaster from "./nav-master";

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: dashboard(),
    icon: LayoutGrid,
  },
];

const masterGroupItems: NavGroup = {
  title: "Master Data",
  items: [
    {
      title: "Roles",
      href: "/master/roles",
      icon: Network,
    },
    {
      title: "Users",
      href: "/master/users",
      icon: Users2,
    },
  ],
};

const footerNavItems: NavItem[] = [
  // {
  //     title: 'Repository',
  //     href: 'https://github.com/laravel/react-starter-kit',
  //     icon: Folder,
  // },
  // {
  //     title: 'Documentation',
  //     href: 'https://laravel.com/docs/starter-kits#react',
  //     icon: BookOpen,
  // },
];

export function AppSidebar() {
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
        <NavMaster group={masterGroupItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
