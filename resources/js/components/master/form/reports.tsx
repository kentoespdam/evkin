import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import ButtonLoading from "@/components/commons/button-loading";
import AspectSelect from "@/components/commons/form/aspect";
import FormulaTextArea from "@/components/commons/form/formula";
import InputFormFieldBuilder from "@/components/commons/form/input-field-builder";
import ReportTypeSelect from "@/components/commons/form/report-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import master from "@/routes/master";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { ReportType } from "@/types/report-types";
import type { Report } from "@/types/reports";

interface ReportsFormProps {
	reportTypes: ReportType[];
	availableCode: MasterInput[];
	aspects: Aspect[];
	data?: Report;
}

// Rules field yang kondisional dengan animasi yang lebih smooth
const ConditionalRulesField = memo(
	({ withRules, defaultValue, error }: { withRules: boolean; defaultValue?: string | null; error?: string }) => (
		<div
			className={cn(
				"transition-all duration-300 ease-in-out overflow-hidden",
				withRules ? "max-h-48 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0",
			)}
		>
			<InputFormFieldBuilder
				id="rules"
				name="rules"
				label="Rules"
				required={withRules}
				defaultValue={defaultValue ?? ""}
				error={error}
				placeholder="Enter input rules"
				type="textarea"
			/>
		</div>
	),
);

ConditionalRulesField.displayName = "ConditionalRulesField";

// Header section yang dipisah untuk reusability
const FormHeader = memo(() => (
	<div className="flex items-center gap-2 pb-4 border-b mb-6">
		<FileTextIcon className="h-5 w-5 text-muted-foreground" />
		<h3 className="font-semibold text-base uppercase tracking-wide text-muted-foreground">Master Report Information</h3>
	</div>
));

FormHeader.displayName = "FormHeader";

const ReportsForm = ({ reportTypes, availableCode, aspects, data }: ReportsFormProps) => {
	const [reportTypeId, setReportTypeId] = useState<string | undefined>(data?.reportType?.id);
	const [withRules, setWithRules] = useState<boolean>(data?.withRules ?? false);

	const formAction = useMemo(() => {
		const form = data?.id ? master.reports.update(data.id) : master.reports.store();

		return {
			action: form.url,
			method: form.method,
		};
	}, [data?.id]);

	const handleReportTypeChange = useCallback((value: string) => {
		setReportTypeId(value);
	}, []);

	const handleWithRulesChange = useCallback((checked: boolean) => {
		setWithRules(checked);
	}, []);

	return (
		<Form {...formAction} className="space-y-6">
			{({ errors, processing }) => (
				<Card>
					<CardContent className="pt-6">
						<FormHeader />

						<div className="space-y-6">
							{/* Urut Field */}
							<InputFormFieldBuilder
								id="urut"
								name="urut"
								label="Urut"
								required
								defaultValue={data?.urut?.toString() ?? "1"}
								placeholder="Enter urut"
								error={errors.urut}
								type="number"
								className="w-32"
							/>

							{/* Report Type Field */}
							<ReportTypeSelect
								value={data?.reportType?.id}
								reportTypes={reportTypes}
								errors={errors}
								onValueChange={handleReportTypeChange}
							/>

							{/* Aspect Field */}
							{reportTypeId && (
								<AspectSelect value={data?.aspect?.id} aspects={aspects} errors={errors} reportTypeId={reportTypeId} />
							)}

							{/* Description Indicator Field */}
							<InputFormFieldBuilder
								id="descIndicator"
								name="descIndicator"
								label="Indikator"
								required
								defaultValue={data?.descIndicator}
								placeholder="Enter input indicator"
								error={errors.descIndicator}
								type="textarea"
							/>

							{/* Description Formula Field */}
							<InputFormFieldBuilder
								id="descFormula"
								name="descFormula"
								label="Rumus"
								required
								defaultValue={data?.descFormula}
								placeholder="Enter input formula"
								error={errors.descFormula}
								type="textarea"
							/>

							{/* Satuan Field */}
							<InputFormFieldBuilder
								id="unit"
								name="unit"
								label="Satuan"
								required
								defaultValue={data?.unit}
								placeholder="Enter unit"
								error={errors.unit}
							/>

							{/* Bobot Field */}
							<InputFormFieldBuilder
								id="weight"
								name="weight"
								label="Bobot"
								required
								defaultValue={data?.weight}
								placeholder="Enter weight"
								error={errors.weight}
								type="number"
								step="0.01"
								className="w-32"
							/>

							{/* With Rules Switch */}
							<Field>
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor="with_rules">
										Gunakan Rule Spesifik <span className="text-destructive">*</span>
									</FieldLabel>
									<div className="flex items-center gap-3">
										<Input type="hidden" name="with_rules" value={withRules ? "1" : "0"} />
										<Switch
											id="with_rules_switch"
											checked={withRules}
											onCheckedChange={handleWithRulesChange}
											aria-label="Toggle specific rules"
										/>
										<span className="text-sm text-muted-foreground">{withRules ? "Aktif" : "Nonaktif"}</span>
									</div>
								</div>
								<p className="text-sm text-muted-foreground mt-2">
									Aktifkan jika laporan ini memerlukan rule spesifik untuk perhitungan
								</p>
							</Field>

							{/* Conditional Rules Field */}
							<ConditionalRulesField withRules={withRules} defaultValue={data?.rules} error={errors.rules} />

							{/* Formula Text Area */}
							<FormulaTextArea availableCode={availableCode} errors={errors} value={data?.formula} />
						</div>

						{/* Form Actions */}
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t">
							<Button type="button" variant="outline" asChild className="gap-2 w-full sm:w-auto">
								<Link href={master.reports().url}>
									<ArrowLeftIcon className="h-4 w-4" />
									Kembali ke Daftar
								</Link>
							</Button>

							<div className="flex gap-3 w-full sm:w-auto">
								<Button
									type="button"
									variant="secondary"
									onClick={() => {
										const form = document.querySelector("form");
										form?.reset();
									}}
									className="w-full sm:w-auto"
								>
									Reset Form
								</Button>
								<ButtonLoading processing={processing} />
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</Form>
	);
};

export default memo(ReportsForm);
