import { memo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types";

interface SummaryItem {
	label: string;
	value: ReactNode;
}

interface TableSummaryProps {
	page: Pagination<unknown>;
	items?: SummaryItem[];
	className?: string;
}

const TableSummary = memo(({ page, items, className = "" }: TableSummaryProps) => {
	const summaryItems: SummaryItem[] = items ?? [
		{ label: "Total data", value: page.meta.total },
		{ label: "Per halaman", value: page.meta.per_page },
		{ label: "Halaman", value: `${page.meta.current_page}/${page.meta.last_page}` },
	];

	const rangeText =
		page.meta.total > 0 ? `${page.meta.from ?? 0}-${page.meta.to ?? 0} dari ${page.meta.total}` : "Belum ada data";

	return (
		<div className={cn("flex flex-wrap items-center justify-end gap-2 text-sm text-muted-foreground", className)}>
			<span>{rangeText}</span>
			{summaryItems.map((item) => (
				<div key={item.label} className="flex items-center gap-2">
					<span>{item.label}</span>
					<Badge variant="secondary" className="font-semibold">
						{item.value}
					</Badge>
				</div>
			))}
		</div>
	);
});

TableSummary.displayName = "TableSummary";

export default TableSummary;
