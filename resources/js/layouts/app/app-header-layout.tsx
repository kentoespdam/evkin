import { AppContent } from "@/components/template/app-content";
import { AppHeader } from "@/components/template/app-header";
import { AppShell } from "@/components/template/app-shell";
import { type BreadcrumbItem } from "@/types";
import type { PropsWithChildren } from "react";

export default function AppHeaderLayout({
  children,
  breadcrumbs,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell>
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent>{children}</AppContent>
    </AppShell>
  );
}
