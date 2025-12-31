import { Pagination } from "@/types";
import { ReactNode, memo } from "react";

interface TableShowTotalTextProps {
  page: Pagination<unknown>;
  tableName: string;
  children?: ReactNode;
}
const TableShowTotalText = memo(
  ({ page, tableName, children }: TableShowTotalTextProps) => {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {children}
        <div className="text-sm text-muted-foreground">
          Showing {page.meta.from ?? 0} - {page.meta.to ?? 0} of{" "}
          {page.meta.total} {tableName}
        </div>
      </div>
    );
  },
);

TableShowTotalText.displayName = "TableShowTotalText";

export default TableShowTotalText;
