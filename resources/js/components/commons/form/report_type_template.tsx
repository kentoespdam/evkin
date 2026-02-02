import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTypeTemplate } from "@/types/report-type";

interface ReportTypeTemplateSelectProps {
	value: string | undefined;
	errors: Record<string, string>;
}
const ReportTypeTemplateSelect = ({ value, errors }: ReportTypeTemplateSelectProps) => {
	return (
		<Field>
			<FieldLabel htmlFor="template_name">
				Report Template <span className="text-destructive">*</span>
			</FieldLabel>
			<Select name="template_name" defaultValue={value}>
				<SelectTrigger>
					<SelectValue placeholder="Select Report Template" />
				</SelectTrigger>
				<SelectContent>
					{ReportTypeTemplate.map((item) => (
						<SelectItem key={item} value={item}>
							{item}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldError>{errors.template_name}</FieldError>
		</Field>
	);
};

export default ReportTypeTemplateSelect;
