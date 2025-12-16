import { NavFooter } from "@/components/template/nav-footer";
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
import { NavGroup, type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import {
  FileTextIcon,
  FileTypeIcon,
  GitPullRequestArrow,
  KeyIcon,
  LayoutGrid,
  Network,
  TextCursorInputIcon,
  Users2,
} from "lucide-react";
import AppLogo from "./app-logo";
import NavMaster from "./nav-master";
import master from "@/routes/master";

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
      href: master.roles().url,
      icon: Network,
    },
    {
      title: "Users",
      href: master.users().url,
      icon: Users2,
    },
    {
      title: "Sources",
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
      title: "Reports",
      href: master.reports().url,
      icon: FileTextIcon,
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
