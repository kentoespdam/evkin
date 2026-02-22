import { memo, useMemo } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMonthName, type MonthOption } from "@/lib/utils";

const MonthHeader = memo(({ year, months, colspan }: { year: number; months: MonthOption[]; colspan: number }) => {
    return months.map((month) => (
        <TableHead key={month.value} rowSpan={2} colSpan={colspan} className="text-center border">
            {month.label} {year}
        </TableHead>
    ));
});
MonthHeader.displayName = "MonthHeader";

const NilaiHeader = memo(({ templateName }: { templateName: string }) => {
    return (
        <>
            <TableHead className="text-center border whitespace-pre-wrap w-24 py-2">Nilai Pencapaian</TableHead>
            <TableHead className="text-center border whitespace-pre-wrap w-24 py-2">Nilai Indikator</TableHead>
            {templateName === "TEMPLATE_PUPR" ? (
                <TableHead className="text-center border whitespace-pre-wrap w-24 py-2">Hasil</TableHead>
            ) : null}
        </>
    );
});
NilaiHeader.displayName = "NilaiHeader";

interface PerhitunganReportTableHeaderProps {
    year: number;
    months: MonthOption[];
    templateName: string;
    lastMonth?: number;
}
const PerhitunganReportTableHeader = memo(
    ({ year, months, templateName, lastMonth }: PerhitunganReportTableHeaderProps) => {
        const colspan = useMemo(() => (templateName === "TEMPLATE_KEPMENDAGRI" ? 2 : 3), [templateName]);
        return (
            <TableHeader>
                <TableRow>
                    <TableHead rowSpan={3} className="text-center border">
                        #
                    </TableHead>
                    <TableHead rowSpan={3} className="text-center border">
                        Indikator
                    </TableHead>
                    <TableHead rowSpan={3} className="text-center border">
                        Rumus
                    </TableHead>
                    <TableHead rowSpan={3} className="text-center border">
                        Satuan
                    </TableHead>
                    <TableHead rowSpan={3} className="text-center border">
                        Bobot (%)
                    </TableHead>
                    <MonthHeader year={year} months={months} colspan={colspan} />
                    <TableHead className="text-center border" colSpan={colspan}>
                        Pencapaian Total
                    </TableHead>
                    <TableHead className="text-center border" colSpan={colspan}>
                        Pencapaian Tahun
                    </TableHead>
                </TableRow>
                <TableRow>
                    <TableHead className="text-center border" colSpan={colspan}>
                        s.d. Bulan {lastMonth ? getMonthName(lastMonth) : "Bulan Terakhir"}
                    </TableHead>
                    <TableHead className="text-center border" colSpan={colspan}>
                        {year - 1}
                    </TableHead>
                </TableRow>
                <TableRow>
                    {months.map((month) => (
                        <NilaiHeader key={month.value} templateName={templateName} />
                    ))}
                    <NilaiHeader templateName={templateName} />
                    <NilaiHeader templateName={templateName} />
                </TableRow>
            </TableHeader>
        );
    },
);
PerhitunganReportTableHeader.displayName = "PerhitunganReportTableHeader";

export default PerhitunganReportTableHeader;
