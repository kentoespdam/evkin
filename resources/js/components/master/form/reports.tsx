import { Form, Link } from "@inertiajs/react";
import {
	ArrowLeftIcon,
	FileTextIcon,
	FunctionSquareIcon,
	InfoIcon,
	ListOrderedIcon,
	RotateCcwIcon,
	SettingsIcon,
	TypeIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ButtonLoading from "@/components/commons/button-loading";
import AspectSelect from "@/components/commons/form/aspect";
import FormulaTextArea from "@/components/commons/form/formula";
import InputFormFieldBuilder from "@/components/commons/form/input-field-builder";
import ReportTypeSelect from "@/components/commons/form/report-type";
import StarRequired from "@/components/commons/star-required";
import FormulaIndicatorTooltip from "@/components/commons/tooltip_formula_indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import master from "@/routes/master";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { ReportType } from "@/types/report-type";
import type { Report } from "@/types/reports";

interface ReportsFormProps {
	reportTypes: ReportType[];
	availableCode: MasterInput[];
	aspects: Aspect[];
	data?: Report;
}

interface ConditionalRulesFieldProps {
	withRules: boolean;
	defaultValue?: string | null;
	error?: string;
}
// Rules field yang kondisional dengan animasi yang lebih smooth
const ConditionalRulesField = memo(({ withRules, defaultValue, error }: ConditionalRulesFieldProps) => {
	const [shouldRender, setShouldRender] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (withRules) {
			setShouldRender(true);
			timer = setTimeout(() => {
				setIsExpanded(true);
			}, 10);
		} else {
			setIsExpanded(false);
			timer = setTimeout(() => {
				setShouldRender(false);
			}, 300);
		}

		return () => clearTimeout(timer);
	}, [withRules]);

	if (!shouldRender) return null;

	return (
		<div
			ref={contentRef}
			className={cn(
				"overflow-hidden",
				"transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
				isExpanded
					? "max-h-[2000px] opacity-100 mt-4" // Nilai max-height yang cukup besar
					: "max-h-0 opacity-0 mt-0",
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
				rows={4}
				className={cn(
					"transition-transform duration-300",
					!isExpanded && "-translate-y-2", // Efek lift saat exit
				)}
			/>
		</div>
	);
});

ConditionalRulesField.displayName = "ConditionalRulesField";

const FormHeader = memo(() => (
	<div className="flex items-center gap-3 pb-6 border-b mb-8">
		<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
			<FileTextIcon className="h-5 w-5 text-primary" />
		</div>
		<div>
			<h3 className="font-semibold text-lg text-foreground">Master Report Information</h3>
			<p className="text-sm text-muted-foreground">Configure report settings and formulas</p>
		</div>
	</div>
));

FormHeader.displayName = "FormHeader";

interface SectionHeaderProps {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description?: string;
}
const SectionHeader = memo(({ icon: Icon, title, description }: SectionHeaderProps) => (
	<div className="flex items-start gap-3 mb-4 mt-8">
		<div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
			<Icon className="h-4 w-4 text-muted-foreground" />
		</div>
		<div className="flex-1">
			<h4 className="font-medium text-sm text-foreground">{title}</h4>
			{description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
		</div>
	</div>
));
SectionHeader.displayName = "SectionHeader";

interface RulesSwitchFieldProps {
	withRules: boolean;
	onChange: (checked: boolean) => void;
	error?: string;
}
const RulesSwitchField = memo(({ withRules, onChange, error }: RulesSwitchFieldProps) => {
	const handleChange = useCallback(
		(checked: boolean) => {
			onChange(checked);
		},
		[onChange],
	);

	return (
		<div className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
			<Field>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
							<SettingsIcon className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<FieldLabel htmlFor="with_rules" className="flex items-center gap-1 mb-0">
								Gunakan Rule Spesifik <StarRequired />
							</FieldLabel>
							<p className="text-xs text-muted-foreground mt-1">
								Aktifkan jika laporan ini memerlukan rule spesifik untuk perhitungan
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Input type="hidden" name="with_rules" value={withRules ? "1" : "0"} />
						<Switch
							id="with_rules_switch"
							checked={withRules}
							onCheckedChange={handleChange}
							aria-label="Toggle specific rules"
							className="data-[state=checked]:bg-green-600"
						/>
						<span
							className={cn(
								"text-sm font-medium transition-colors min-w-[70px] text-right",
								withRules ? "text-green-600" : "text-muted-foreground",
							)}
						>
							{withRules ? "Aktif" : "Nonaktif"}
						</span>
					</div>
				</div>
				{error && <p className="text-sm text-destructive mt-2">{error}</p>}
			</Field>
		</div>
	);
});
RulesSwitchField.displayName = "RulesSwitchField";

interface FormulaIndicatorProps {
	errors: Record<string, string>;
	value?: string;
}
const FormulaIndicator = memo(({ errors, value }: FormulaIndicatorProps) => {
	return (
		<Field>
			<FieldLabel htmlFor={"formula_indicator"}>
				Formula Indikator <StarRequired />
				<FormulaIndicatorTooltip />
			</FieldLabel>
			<Textarea
				id="formula_indicator"
				name="formula_indicator"
				defaultValue={value}
				placeholder="Contoh: &#10;GTE 80; &#10;LTE 79;"
				className={cn(
					"font-mono text-sm transition-all",
					errors.formulaIndicator
						? "border-destructive focus-visible:ring-destructive"
						: "focus-visible:ring-primary/20",
				)}
				rows={4}
			/>
			{errors.formulaIndicator && (
				<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
					<InfoIcon className="h-3 w-3" />
					{errors.formulaIndicator}
				</p>
			)}
		</Field>
	);
});
FormulaIndicator.displayName = "FormulaIndicator";
interface FormulaArchivementProps {
	errors: Record<string, string>;
	value?: string;
}
const FormulaArchivement = memo(({ errors, value }: FormulaArchivementProps) => {
	return (
		<Field>
			<FieldLabel htmlFor={"formula_archivement"}>
				Formula Pencapaian <StarRequired />
				<FormulaIndicatorTooltip />
			</FieldLabel>
			<Textarea
				id="formula_archivement"
				name="formula_archivement"
				defaultValue={value}
				placeholder="Contoh: &#10;GTE 80; &#10;LTE 79;"
				className={cn(
					"font-mono text-sm transition-all",
					errors.formulaArchivement
						? "border-destructive focus-visible:ring-destructive"
						: "focus-visible:ring-primary/20",
				)}
				rows={4}
			/>
			{errors.formulaArchivement && (
				<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
					<InfoIcon className="h-3 w-3" />
					{errors.formulaArchivement}
				</p>
			)}
		</Field>
	);
});
FormulaArchivement.displayName = "FormulaArchivement";

const FormActions = memo(({ processing, errors }: { processing: boolean; errors: Record<string, string> }) => {
	const formRef = useRef<HTMLFormElement>(null);

	const handleReset = useCallback(() => {
		if (formRef.current) {
			formRef.current.reset();
			// Reset form dengan lebih smooth
			formRef.current.querySelectorAll("input, textarea, select").forEach((el) => {
				if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
					el.value = "";
				}
			});
		}
	}, []);

	return (
		<>
			{Object.keys(errors).length > 0 && (
				<div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="flex items-start gap-3">
						<div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/20 flex-shrink-0">
							<InfoIcon className="h-4 w-4 text-destructive" />
						</div>
						<div className="flex-1">
							<p className="text-sm font-medium text-destructive mb-2">
								Terdapat {Object.keys(errors).length} kesalahan dalam form:
							</p>
							<ul className="text-sm text-destructive/90 space-y-1">
								{Object.entries(errors).map(([key, message]) => (
									<li key={key} className="flex items-start gap-2">
										<span className="text-destructive/70 mt-0.5">•</span>
										<span>{message}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t">
				<Button
					type="button"
					variant="outline"
					asChild
					className="gap-2 w-full sm:w-auto hover:bg-accent transition-colors"
				>
					<Link href={master.reports().url}>
						<ArrowLeftIcon className="h-4 w-4" />
						Kembali ke Daftar
					</Link>
				</Button>

				<div className="flex gap-3 w-full sm:w-auto">
					<Button
						type="button"
						variant="secondary"
						onClick={handleReset}
						className="w-full sm:w-auto gap-2 hover:bg-secondary/80 transition-colors"
					>
						<RotateCcwIcon className="h-4 w-4" />
						Reset Form
					</Button>
					<ButtonLoading processing={processing} />
				</div>
			</div>
		</>
	);
});
FormActions.displayName = "FormActions";

const ReportsForm = memo(({ reportTypes, availableCode, aspects, data }: ReportsFormProps) => {
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

	const defaultValues = useMemo(
		() => ({
			urut: data?.urut?.toString() ?? "1",
			descIndicator: data?.descIndicator ?? "",
			descFormula: data?.descFormula ?? "",
			unit: data?.unit ?? "",
			weight: data?.weight?.toString() ?? "",
			formula: data?.formula ?? "",
			formulaIndicator: data?.formulaIndicator ?? "",
			rules: data?.rules ?? "",
			formulaArchivement: data?.formulaArchivement ?? "",
		}),
		[data],
	);

	const filteredAspects = useMemo(() => {
		if (!reportTypeId) return [];
		return aspects.filter((aspect) => aspect.reportType?.id === reportTypeId);
	}, [aspects, reportTypeId]);

	return (
		<Form {...formAction} className="space-y-6">
			{({ errors, processing }) => (
				<Card className="shadow-md">
					<CardContent className="pt-6">
						<FormHeader />

						{/* Section 1: Basic Information */}
						<div className="space-y-6">
							<SectionHeader
								icon={ListOrderedIcon}
								title="Informasi Dasar"
								description="Pengaturan urutan dan kategori laporan"
							/>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
								{/* Seq Field */}
								<InputFormFieldBuilder
									id="seq"
									name="seq"
									label="Sequence"
									required={false}
									defaultValue={data?.seq?.toString() ?? "0"}
									placeholder="0"
									error={errors.seq}
									type="number"
									className="w-full"
								/>

								{/* Urut Field */}
								<InputFormFieldBuilder
									id="urut"
									name="urut"
									label="Urutan"
									required
									defaultValue={defaultValues.urut}
									placeholder="1"
									error={errors.urut}
									type="text"
									className="w-full"
								/>

								{/* Report Type Field */}
								<div className="md:col-span-2">
									<ReportTypeSelect
										value={reportTypeId}
										reportTypes={reportTypes}
										errors={errors}
										onValueChange={handleReportTypeChange}
									/>
								</div>

								{/* Aspect Field */}
								{reportTypeId && (
									<div className="md:col-span-2">
										<AspectSelect
											value={data?.aspect?.id}
											aspects={filteredAspects}
											errors={errors}
											reportTypeId={reportTypeId}
										/>
									</div>
								)}
							</div>
						</div>

						{/* Section 2: Description & Details */}
						<div className="space-y-6">
							<SectionHeader
								icon={TypeIcon}
								title="Deskripsi & Detail"
								description="Informasi indikator, rumus, satuan dan bobot"
							/>
							<div className="space-y-6 pl-11">
								{/* Description Indicator Field */}
								<InputFormFieldBuilder
									id="desc_indicator"
									name="desc_indicator"
									label="Indikator"
									required
									defaultValue={defaultValues.descIndicator}
									placeholder="Masukkan deskripsi indikator"
									error={errors.descIndicator}
									type="textarea"
									rows={3}
								/>

								{/* Description Formula Field */}
								<InputFormFieldBuilder
									id="desc_formula"
									name="desc_formula"
									label="Rumus"
									required
									defaultValue={defaultValues.descFormula}
									placeholder="Masukkan deskripsi rumus"
									error={errors.descFormula}
									type="textarea"
									rows={3}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Satuan Field */}
									<InputFormFieldBuilder
										id="unit"
										name="unit"
										label="Satuan"
										required
										defaultValue={defaultValues.unit}
										placeholder="%, buah, kali, dll"
										error={errors.unit}
									/>

									{/* Bobot Field */}
									<InputFormFieldBuilder
										id="weight"
										name="weight"
										label="Bobot"
										required
										defaultValue={defaultValues.weight}
										placeholder="0.000"
										error={errors.weight}
										type="number"
										step="0.001"
										className="w-full"
										min={0}
									/>
								</div>
							</div>
						</div>

						{/* Section 3: Rules Configuration */}
						<div className="space-y-6">
							<SectionHeader
								icon={SettingsIcon}
								title="Konfigurasi Rules"
								description="Pengaturan rules spesifik untuk perhitungan"
							/>
							<div className="space-y-6 pl-11">
								{/* With Rules Switch */}
								<RulesSwitchField withRules={withRules} onChange={handleWithRulesChange} error={errors.with_rules} />

								{/* Conditional Rules Field */}
								<ConditionalRulesField withRules={withRules} defaultValue={defaultValues.rules} error={errors.rules} />
							</div>
						</div>

						{/* Section 4: Formula Configuration */}
						<div className="space-y-6">
							<SectionHeader
								icon={FunctionSquareIcon}
								title="Konfigurasi Formula"
								description="Pengaturan formula indikator dan formula perhitungan"
							/>
							<div className="space-y-6 pl-11">
								{/* Formula Indikator Field */}
								<FormulaIndicator errors={errors} value={defaultValues.formulaIndicator} />

								{/* Formula Text Area */}
								<FormulaTextArea availableCode={availableCode} errors={errors} value={defaultValues.formula} />

								{/* Formula Archivement Field */}
								<InputFormFieldBuilder
									id="formula_archivement"
									name="formula_archivement"
									label="Formula Pencapaian"
									defaultValue={defaultValues.formulaArchivement}
									placeholder="Masukkan formula pencapaian"
									error={errors.formulaArchivement}
									type="textarea"
									className="w-full"
								/>
							</div>
						</div>

						{/* Form Actions */}
						<FormActions processing={processing} errors={errors} />
					</CardContent>
				</Card>
			)}
		</Form>
	);
});
ReportsForm.displayName = "ReportsForm";

export default ReportsForm;
