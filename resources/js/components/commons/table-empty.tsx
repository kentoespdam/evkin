import { ShieldIcon } from "lucide-react";
import { memo } from "react";

const TableEmpty = memo(({ tableName }: { tableName: string }) => {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<ShieldIcon className="h-12 w-12 text-muted-foreground/50" />
			<h3 className="mt-4 text-lg font-semibold">Tidak ada {tableName} ditemukan</h3>
			<p className="mt-2 text-sm text-muted-foreground">Coba ubah pencarian Anda atau tambahkan {tableName} baru.</p>
		</div>
	);
});

TableEmpty.displayName = "TableEmpty";

export default TableEmpty;
