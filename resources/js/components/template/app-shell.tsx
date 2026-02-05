import { usePage } from "@inertiajs/react";
import { memo, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { SharedData } from "@/types";

const HeaderLayout = memo(({ children, className }: { children: React.ReactNode; className?: string }) => (
	<div className={cn("flex min-h-screen w-full flex-col", className)}>{children}</div>
));

HeaderLayout.displayName = "HeaderLayout";

const SidebarLayout = memo(
	({ children, defaultOpen, className }: { children: React.ReactNode; defaultOpen: boolean; className?: string }) => (
		<SidebarProvider defaultOpen={defaultOpen}>
			<div className={className}>{children}</div>
		</SidebarProvider>
	),
);

SidebarLayout.displayName = "SidebarLayout";
interface AppShellProps {
	children: React.ReactNode;
	variant?: "header" | "sidebar";
}

export function AppShell({ children, variant = "header" }: AppShellProps) {
	const pageData = usePage<SharedData>();
	const isOpen = useMemo(() => {
		if (pageData.props.sidebarOpen !== undefined) return pageData.props.sidebarOpen;
		return pageData.props.sidebarOpen ?? true;
	}, [pageData.props.sidebarOpen]);

	const layout = useMemo(() => {
		return variant === "sidebar" ? (
			<SidebarLayout defaultOpen={isOpen} className="flex min-h-screen w-full">
				{children}
			</SidebarLayout>
		) : (
			<HeaderLayout>{children}</HeaderLayout>
		);
	}, [variant, isOpen, children]);

	return layout;
}
