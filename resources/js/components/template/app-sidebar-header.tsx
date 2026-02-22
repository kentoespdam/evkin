import { Monitor, Moon, Sun } from "lucide-react";
import { Breadcrumbs } from "@/components/template/breadcrumbs";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppearance } from "@/hooks/use-appearance";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
	const { appearance, updateAppearance } = useAppearance();
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Breadcrumbs breadcrumbs={breadcrumbs} />
			</div>
			{/* Theme Switcher */}
			<div className="ml-auto flex items-center gap-2">
				<div className="flex gap-1">
					<Button
						variant={appearance === "light" ? "secondary" : "ghost"}
						size="icon"
						aria-label="Ubah ke mode terang"
						className="transition-all duration-200"
						onClick={() => updateAppearance("light")}
					>
						<Sun className="h-5 w-5 text-yellow-500" />
					</Button>
					<Button
						variant={appearance === "dark" ? "secondary" : "ghost"}
						size="icon"
						aria-label="Ubah ke mode gelap"
						className="transition-all duration-200"
						onClick={() => updateAppearance("dark")}
					>
						<Moon className="h-5 w-5 text-blue-500" />
					</Button>
					<Button
						variant={appearance === "system" ? "secondary" : "ghost"}
						size="icon"
						aria-label="Ikuti sistem"
						className="transition-all duration-200"
						onClick={() => updateAppearance("system")}
					>
						<Monitor className="h-5 w-5 text-neutral-500" />
					</Button>
				</div>
				<div className="ml-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 select-none">
					{appearance === "light" && "Mode Terang"}
					{appearance === "dark" && "Mode Gelap"}
					{appearance === "system" && "Mode Sistem"}
				</div>
			</div>
		</header>
	);
}
