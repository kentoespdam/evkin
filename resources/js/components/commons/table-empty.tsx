import { ShieldIcon } from "lucide-react";
import { memo } from "react";

const TableEmpty = memo(({ tableName }: { tableName: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShieldIcon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">No {tableName} found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Try adjusting your search or add a new {tableName}.
      </p>
    </div>
  );
});

TableEmpty.displayName = "TableEmpty";

export default TableEmpty;
