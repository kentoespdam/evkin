import { Fragment, memo, useMemo } from "react";
import TableEmpty from "@/components/commons/table-empty";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatNumber } from "@/lib/utils";
import { useYearRangeLaporanTahunan } from "@/pages/rekap/tahunan";
import type { Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { RekapInputTahunan, RekapInputTahunanFilters } from "@/types/rekap-tahunan";
import type { ReportType } from "@/types/report-type";
import PaginationNav from "../commons/pagination-nav";
import AspectRowBuilder from "./aspect-row-builder";
import SectionHeaderRekapBuilder from "./section-header";

interface RekapInputTahunansTableProps {
    page: Pagination<RekapInputTahunan>;
    aspects: Aspect[];
    reportTypes: ReportType[];
    filters: RekapInputTahunanFilters;
}

const useGroupedData = (data: RekapInputTahunan[], aspectId: string) => {
    return useMemo(() => {
        const groupedRows = new Map<string, RekapInputTahunan[]>();
        const valuesMap = new Map<string, number>();

        data
            .filter((item) => item.masterInput?.aspect?.id === aspectId)
            .forEach((item) => {
                const inputId = item.masterInput?.id;
                if (!inputId) return;

                const existing = groupedRows.get(inputId) ?? [];
                groupedRows.set(inputId, [...existing, item]);

                // Cache nilai untuk performa
                valuesMap.set(`${item.id}-${inputId}-${item.year}`, item.nilai);
            });

        const rowItems = Array.from(groupedRows.values())
            .map((items) => items[0])
            .filter(Boolean);

        return { rowItems, valuesByInputYear: valuesMap };
    }, [data, aspectId]);
};

const RekapInputTahunansTableHeader = memo(({ years }: { years: number[] }) => {
    return (
        <TableHeader>
            <TableRow className="bg-muted/50">
                <TableHead className="w-16 border text-center font-semibold">#</TableHead>
                <TableHead className="min-w-[260px] border font-semibold">Indikator</TableHead>
                <TableHead className="min-w-[180px] border font-semibold">Sumber Data</TableHead>
                <TableHead className="w-24 border text-center font-semibold">Satuan</TableHead>
                {years.map((year) => (
                    <TableHead key={year} className="border text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                            <span>{year}</span>
                        </div>
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
});
RekapInputTahunansTableHeader.displayName = "RekapInputTahunansTableHeader";

interface BodyRowBuilderProps {
    item: RekapInputTahunan;
    years: number[];
    valuesByInputYear: Map<string, number>;
}

const BodyRow = memo(({ item, years, valuesByInputYear }: BodyRowBuilderProps) => {
    const itemId = item.id;
    const inputId = item.masterInput?.id ?? "";

    return (
        <TableRow className="group hover:bg-muted/40">
            <TableCell className="border text-center">
                <Badge variant="outline" className="font-semibold">
                    {item.seq}
                </Badge>
            </TableCell>
            <TableCell className="border">
                <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.masterInput?.description}</p>
                    <p className="text-xs text-muted-foreground">Kode: {item.kode}</p>
                </div>
            </TableCell>
            <TableCell className="border">
                <Badge variant="outline">{item.masterSource?.name}</Badge>
            </TableCell>
            <TableCell className="border text-center">
                <Badge variant="secondary">{item.masterInput?.satuan}</Badge>
            </TableCell>
            {years.map((year) => {
                const nilaiForYear = valuesByInputYear.get(`${itemId}-${inputId}-${year}`);
                const isFilled = nilaiForYear !== undefined && nilaiForYear !== 0;

                return (
                    <TableCell
                        key={year}
                        className={cn("border text-center", {
                            "text-right text-foreground": isFilled,
                            "text-muted-foreground": !isFilled,
                        })}
                    >
                        {isFilled ? formatNumber(nilaiForYear) : "-"}
                    </TableCell>
                );
            })}
        </TableRow>
    );
});

BodyRow.displayName = "BodyRow";

interface BodyBuilderProps {
    aspect: Aspect;
    years: number[];
    page: Pagination<RekapInputTahunan>;
}
const BodyBuilder = memo(({ aspect, years, page }: BodyBuilderProps) => {
    const { rowItems, valuesByInputYear } = useGroupedData(page.data, aspect.id);

    if (rowItems.length === 0) {
        return null;
    }

    return (
        <TableBody>
            {rowItems.map((item) => (
                <BodyRow key={item.id} item={item} years={years} valuesByInputYear={valuesByInputYear} />
            ))}
        </TableBody>
    );
});
BodyBuilder.displayName = "BodyBuilder";

interface RekapInputTahunansTableBodyProps {
    page: Pagination<RekapInputTahunan>;
    reportType: ReportType;
    aspects: Aspect[];
    years: number[];
}

const RekapInputTahunansTableBody = memo(({ page, reportType, aspects, years }: RekapInputTahunansTableBodyProps) => {
    const aspectRows = useMemo(
        () => aspects.filter((aspect) => aspect.reportType.id === reportType.id),
        [aspects, reportType.id],
    );

    if (aspectRows.length === 0) {
        return null;
    }

    return (
        <>
            {aspectRows.map((aspect) => (
                <Fragment key={aspect.id}>
                    <AspectRowBuilder aspect={aspect} colspan={years.length + 4} />
                    <BodyBuilder aspect={aspect} page={page} years={years} />
                </Fragment>
            ))}
        </>
    );
});
RekapInputTahunansTableBody.displayName = "RekapInputTahunansTableBody";

const RekapInputTahunansTable = ({ page, aspects, reportTypes, filters }: RekapInputTahunansTableProps) => {
    const years = useYearRangeLaporanTahunan(filters.fromYear, filters.toYear);

    if (page.data.length === 0) {
        return <TableEmpty tableName="Rekap Tahunan" />;
    }

    return (
        <div className="space-y-6">
            {reportTypes.map((reportType) => (
                <div key={reportType.id} className="overflow-hidden rounded-lg border">
                    <Table>
                        <SectionHeaderRekapBuilder title={reportType.name} colSpan={years.length + 4} />
                        <RekapInputTahunansTableHeader years={years} />
                        <RekapInputTahunansTableBody page={page} reportType={reportType} aspects={aspects} years={years} />
                    </Table>
                </div>
            ))}
            <PaginationNav page={page} />
        </div>
    );
};

export default RekapInputTahunansTable;
