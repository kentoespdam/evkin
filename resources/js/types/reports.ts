import { ReportType } from "./report-types";

export interface Report {
    id: string;
    urut: number;
    reportType: ReportType
    descIndicator: string
    descFormula: string
    unit: string
    weight: number
    formula: string
}