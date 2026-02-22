import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types";

interface TableShowTotalTextProps {
	page: Pagination<unknown>;
	tableName: string;
	children?: ReactNode;
	className?: string;
}
const TableShowTotalText = memo(({ page, tableName, children, className = "" }: TableShowTotalTextProps) => {
	return (
		<div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
			{children}
			<div className="text-sm text-muted-foreground">
				Menampilkan {page.meta.from ?? 0} - {page.meta.to ?? 0} dari {page.meta.total} {tableName}
			</div>
		</div>
	);
});

TableShowTotalText.displayName = "TableShowTotalText";

export default TableShowTotalText;
