import { memo, type ReactNode, Suspense, useMemo } from "react";
import { Toaster } from "sonner";
import { useErrorToast } from "@/hooks/use-error-toast";
import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";
import type { BreadcrumbItem } from "@/types";

const TOASTER_CONFIG = {
	position: "top-right" as const,
	richColors: true,
	duration: 4000,
	closeButton: true,
	visibleToasts: 3,
	expand: false,
} as const;

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
	useErrorToast();
	return <>{children}</>;
};

const MemoizedToaster = memo(({ config }: { config: typeof TOASTER_CONFIG }) => <Toaster {...config} />);

MemoizedToaster.displayName = "MemoizedToaster";

const LayoutSkeleton = () => (
	<div className="flex h-screen w-full items-center justify-center bg-background">
		<div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
	</div>
);

interface AppLayoutProps {
	children: ReactNode;
	breadcrumbs?: BreadcrumbItem[];
	showToaster?: boolean;
	toasterConfig?: Partial<typeof TOASTER_CONFIG>;
}

const AppLayout = ({ children, breadcrumbs, toasterConfig, showToaster = true, ...props }: AppLayoutProps) => {
	const mergedToasterConfig = useMemo(
		() => ({
			...TOASTER_CONFIG,
			...toasterConfig,
		}),
		[toasterConfig],
	);

	return (
		<ErrorBoundary>
			<Suspense fallback={<LayoutSkeleton />}>
				<AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
					{children}
				</AppLayoutTemplate>
			</Suspense>

			{showToaster && <MemoizedToaster config={mergedToasterConfig} />}
		</ErrorBoundary>
	);
};

AppLayout.displayName = "AppLayout";

export default AppLayout;
