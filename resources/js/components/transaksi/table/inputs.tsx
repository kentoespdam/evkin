import { Form } from "@inertiajs/react";
import type React from "react";
import { memo, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { randomUUID } from "@/lib/utils";
import transaksi from "@/routes/transaksi";
import type { RoleInput } from "@/types/role-inputs";
import type { TransaksiInput, TransaksiInputFilter } from "@/types/transaksi-inputs";
import TransaksiInputsForm from "../form/inputs";

interface TransaksiInputsTableProps {
    page: RoleInput[];
    data: TransaksiInput[];
    filters: TransaksiInputFilter;
    setIsForm: React.Dispatch<React.SetStateAction<boolean>>;
    isForm: boolean;
}

const TransaksiInputsTableHeader = memo(() => {
    return (
        <TableHeader>
            <TableRow>
                <TableHead>Indikator</TableHead>
            </TableRow>
        </TableHeader>
    );
});
TransaksiInputsTableHeader.displayName = "TransaksiInputsTableHeader";

const TransaksiInputsTableBody = memo(
    ({ page, data, isForm }: Omit<TransaksiInputsTableProps, "filters" | "setIsForm">) => {
        const rows = useMemo(() => {
            const firstNumber = 1;
            return page.map((item, index) => ({
                urut: firstNumber + index,
                ...item,
                data: data.find((d) => d.masterInput.id === item.masterInput.id),
            }));
        }, [page, data]);

        const descriptionFormatter = (description: string) => {
            const descs = description.split("\n");
            return (
                <div className="grid gap-1">
                    {descs.map((desc) => <div key={randomUUID()}>{desc}</div>)}
                </div>
            );
        };
        return (
            <TableBody>
                {rows.map((item) => (
                    <TableRow key={item.id} className="border-none">
                        <TableCell>
                            <Item variant="outline">
                                <ItemMedia>
                                    <Badge variant="default" className="capitalize">
                                        {item.urut}
                                    </Badge>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>{descriptionFormatter(item.masterInput.description)}</ItemTitle>
                                    <TransaksiInputsForm isForm={isForm} row={item} />
                                </ItemContent>
                            </Item>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    },
);

const TransaksiInputsTable = ({ page, data, filters, setIsForm, isForm }: TransaksiInputsTableProps) => {
    const formAction = useMemo(
        () => ({
            action: transaksi.inputs.store().url,
            method: transaksi.inputs.store().method,
        }),
        [],
    );

    const handleSuccess = () => {
        setIsForm((prev) => !prev);
        toast.success("Transaksi Inputs saved successfully");
    };
    return (
        <Form {...formAction} className="overflow-x-auto" onSuccess={handleSuccess}>
            <Input name="year" type="hidden" defaultValue={filters.year} />
            <Input name="month" type="hidden" defaultValue={filters.month} />
            <Table>
                <TransaksiInputsTableHeader />
                <TransaksiInputsTableBody page={page} data={data} isForm={isForm} />
            </Table>
            {isForm && (
                <Button type="submit" className="mt-4 w-full">
                    Simpan
                </Button>
            )}
        </Form>
    );
};

export default TransaksiInputsTable;
