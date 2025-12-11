import { AppContent } from "@/components/template/app-content";
import { AppShell } from "@/components/template/app-shell";
import { AppSidebar } from "@/components/template/app-sidebar";
import { AppSidebarHeader } from "@/components/template/app-sidebar-header";
import { type BreadcrumbItem } from "@/types";
import { type PropsWithChildren } from "react";

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar" className="overflow-x-hidden">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </AppContent>
    </AppShell>
  );
}
