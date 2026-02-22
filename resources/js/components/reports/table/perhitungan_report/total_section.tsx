import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import type { MonthOption } from "@/lib/utils";
import TotalNilaiCells from "./total_nilai_cells";

interface TotalSectionProps {
    nilaiKinerjaTotalByMonthAndYear: Map<string, number>;
    nilaiKinerjaTotalArchivement: number;
    performanceByMonthAndYear: Map<string, string>;
    performanceArchivement: string;
    months: MonthOption[];
    year: number;
    templateName: string;
}
const TotalSection = ({
    nilaiKinerjaTotalByMonthAndYear,
    nilaiKinerjaTotalArchivement,
    performanceByMonthAndYear,
    performanceArchivement,
    months,
    year,
    templateName
}: TotalSectionProps) => {
    const keyLastYear = `${year - 1}-12`;
    const nilaiKinerjaTotalLastYear = nilaiKinerjaTotalByMonthAndYear.get(keyLastYear)
    const performanceLastYear = performanceByMonthAndYear.get(keyLastYear) || "-";

    const colspan = templateName === "TEMPLATE_KEPMENDAGRI" ? 2 : 3;
    return (
        <TableFooter>
            <TableRow>
                <TableCell className="border bg-amber-100 pl-12 font-bold" colSpan={5}>
                    NILAI KINERJA TOTAL
                </TableCell>
                {months.map((month) => {
                    const key = `${year}-${month.value}`;
                    const nilaiKinerjaTotal = nilaiKinerjaTotalByMonthAndYear.get(key);

                    return <TotalNilaiCells key={month.value} totalNilai={nilaiKinerjaTotal} templateName={templateName} />;
                })}

                <TotalNilaiCells totalNilai={nilaiKinerjaTotalArchivement} templateName={templateName} />
                <TotalNilaiCells totalNilai={nilaiKinerjaTotalLastYear} templateName={templateName} />
            </TableRow>

            <TableRow>
                <TableCell className="border bg-amber-100 pl-12 font-bold" colSpan={5}>KINERJA</TableCell>
                {months.map((month) => {
                    const key = `${year}-${month.value}`;
                    const performance = performanceByMonthAndYear.get(key);

                    return (
                        <TableCell key={month.value} className="border bg-amber-100 font-bold text-center" colSpan={colspan}>
                            {performance}
                        </TableCell>
                    );
                })}
                <TableCell className="border bg-amber-100 font-bold text-center" colSpan={colspan}>
                    {performanceArchivement}
                </TableCell>
                <TableCell className="border bg-amber-100 font-bold text-center" colSpan={colspan}>
                    {performanceLastYear}
                </TableCell>
            </TableRow>
        </TableFooter>
    );
};

export default TotalSection;
