import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportType } from "@/types/report-type";

interface ReportTypeSelectProps {
	value: string | undefined;
	reportTypes: ReportType[];
	errors: Record<string, string>;
	onValueChange?: (value: string) => void;
}
const ReportTypeSelect = ({ value, reportTypes, errors, onValueChange }: ReportTypeSelectProps) => {
	return (
		<Field>
			<FieldLabel htmlFor="report_type_id">
				Tipe Laporan <span className="text-destructive">*</span>
			</FieldLabel>
			<Select name="report_type_id" defaultValue={value} onValueChange={onValueChange}>
				<SelectTrigger>
					<SelectValue placeholder="Pilih Tipe Laporan" />
				</SelectTrigger>
				<SelectContent>
					{reportTypes.map((item) => (
						<SelectItem key={item.id} value={item.id}>
							{item.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldError>{errors.report_type_id}</FieldError>
		</Field>
	);
};

export default ReportTypeSelect;
