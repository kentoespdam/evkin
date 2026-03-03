import { memo } from "react";
import { TableCell } from "@/components/ui/table";
import { evaluateRulesOptions } from "@/lib/formula_helper";
import type { PerhitunganReportDetail } from "@/types/perhitungan-reports";
import type { Report } from "@/types/report";
import NilaiCells from "./nilai_cells";

interface NilaiWithRulesProps {
    templateName: string;
    rules?: string | null;
    nilai?: number;
    nilaiIndicator?: number;
    nilaiBobot?: number;
}
const NilaiWithRules = memo(({ rules, nilai, nilaiIndicator, templateName, nilaiBobot }: NilaiWithRulesProps) => {
    return (
        <>
            <TableCell className="border text-center whitespace-pre-wrap">{evaluateRulesOptions(rules, nilai)}</TableCell>
            <TableCell className="border text-center">{nilaiIndicator ? nilaiIndicator : "-"}</TableCell>
            {templateName === "TEMPLATE_PUPR" ? (
                <TableCell className="border text-center">{nilaiBobot ? nilaiBobot : "-"}</TableCell>
            ) : null}
        </>
    );
});
NilaiWithRules.displayName = "NilaiWithRules";

interface NilaiByMonthProps {
    report: Report;
    year: number;
    months: { value: number; label: string }[];
    reportsByKey: Map<string, PerhitunganReportDetail>;
    templateName: string;
}
const NilaiByMonth = memo(({ report, year, months, reportsByKey, templateName }: NilaiByMonthProps) =>
    months.map((month) => {
        const key = `${report.id}-${year}-${month.value}`;
        const reportDetail = reportsByKey?.get(key);
        const nilai = reportDetail?.nilai;
        const nilaiIndicator = reportDetail?.nilaiIndicator;
        const nilaiBobot = reportDetail?.nilaiBobot;

        return report.withRules ? (
            <NilaiWithRules
                templateName={templateName}
                key={month.value}
                rules={report?.rules}
                nilai={nilai}
                nilaiIndicator={nilaiIndicator}
                nilaiBobot={nilaiBobot}
            />
        ) : (
            <NilaiCells
                key={month.value}
                nilai={nilai}
                nilaiIndicator={nilaiIndicator}
                nilaiBobot={nilaiBobot}
                templateName={templateName}
            />
        );
    }),
);
NilaiByMonth.displayName = "NilaiByMonth";

export default NilaiByMonth;
