import { router, usePage } from "@inertiajs/react";
import { LockIcon, LockOpenIcon } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { monthsList } from "@/lib/utils";
import type { SharedData } from "@/types";
import type { LockTransaksiInput } from "@/types/lock-transaksi-input";
import { Button } from "../ui/button";
import { TableHead, TableHeader, TableRow } from "../ui/table";

const RekapInputBulanansTableHeader = memo(
    ({ lockTransaksiInputs, year }: { lockTransaksiInputs: LockTransaksiInput[]; year: number }) => {
        const { isAdmin } = usePage<SharedData>().props;
        const handleToggleLock = useCallback(
            (month: number, isLocked: boolean) => {
                router.patch(
                    `/transaksi/lock/${year}/${month}`,
                    { is_locked: !isLocked },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(!isLocked ? "Periode berhasil dikunci" : "Periode berhasil dibuka");
                        },
                        onError: (errors) => {
                            toast.error(errors.message || "Gagal mengubah status lock");
                        },
                    },
                );
            },
            [year],
        );

        return (
            <TableHeader>
                <TableRow className="bg-muted/50">
                    <TableHead className="w-16 border text-center font-semibold">#</TableHead>
                    <TableHead className="min-w-[260px] border font-semibold">Indikator</TableHead>
                    <TableHead className="min-w-[180px] border font-semibold">Sumber Data</TableHead>
                    <TableHead className="w-24 border text-center font-semibold">Satuan</TableHead>
                    {monthsList().map((month) => {
                        const lock = lockTransaksiInputs.find((lock) => lock.month === month.value);
                        const isLocked = lock?.isLocked ?? false;

                        return (
                            <TableHead key={month.value} className="border text-center font-semibold">
                                <div className="flex items-center justify-center gap-2">
                                    <span>{month.label}</span>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleToggleLock(month.value, isLocked)}
                                            title={isLocked ? "Klik untuk membuka kunci" : "Klik untuk mengunci"}
                                        >
                                            {isLocked ? (
                                                <LockIcon className="h-3 w-3 text-red-500" />
                                            ) : (
                                                <LockOpenIcon className="h-3 w-3 text-green-500" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </TableHead>
                        );
                    })}
                    <TableHead className="w-32 border text-center font-semibold">RATA-RATA / PENCAPAIAN</TableHead>
                </TableRow>
            </TableHeader>
        );
    },
);
RekapInputBulanansTableHeader.displayName = "RekapInputBulanansTableHeader";

export default RekapInputBulanansTableHeader;
