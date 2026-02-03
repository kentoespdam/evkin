import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, FileTypeIcon, FunctionSquareIcon, InfoIcon, LayoutTemplateIcon, TagIcon } from "lucide-react";
import { memo, useMemo } from "react";
import ButtonLoading from "@/components/commons/button-loading";
import ReportTypeTemplateSelect from "@/components/commons/form/report_type_template";
import FormulaIndicator from "@/components/commons/form/textarea-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import master from "@/routes/master";
import type { ReportType } from "@/types/report-type";

interface ReportTypesFormProps {
	data?: ReportType;
}

const FormHeader = memo(() => (
	<div className="flex items-center gap-3 pb-6 border-b mb-8">
		<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
			<FileTypeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
		</div>
		<div>
			<h3 className="font-semibold text-lg text-foreground">Master Report Type Configuration</h3>
			<p className="text-sm text-muted-foreground">Configure report type settings and performance formulas</p>
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

const ReportTypesForm = memo(({ data }: ReportTypesFormProps) => {
	const formAction = useMemo(() => {
		if (data?.id) {
			const form = master.reportTypes.update(data.id);

			return {
				action: form.url,
				method: form.method,
			};
		}
		const form = master.reportTypes.store();
		return {
			action: form.url,
			method: form.method,
		};
	}, [data]);

	return (
		<Form {...formAction} resetOnSuccess>
			{({ errors, processing }) => (
				<Card className="shadow-md">
					<CardContent className="pt-6">
						<FormHeader />

						<div className="space-y-6">
							{/* Section 1: Basic Information */}
							<SectionHeader
								icon={TagIcon}
								title="Informasi Dasar"
								description="Tentukan nama tipe laporan yang akan digunakan"
							/>
							<div className="pl-11">
								{/* Name Field */}
								<Field>
									<FieldLabel htmlFor="name" className="flex items-center gap-2">
										Name <span className="text-destructive">*</span>
										<span className="text-xs text-muted-foreground font-normal">(Wajib diisi)</span>
									</FieldLabel>
									<Input
										id="name"
										name="name"
										type="text"
										defaultValue={data?.name}
										placeholder="Contoh: Laporan Kinerja, Laporan Tahunan"
										className={cn(
											"transition-all",
											errors.name
												? "border-destructive focus-visible:ring-destructive"
												: "focus-visible:ring-blue-500/20",
										)}
										required
									/>
									{errors.name && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.name}
										</p>
									)}
									{!errors.name && (
										<p className="text-xs text-muted-foreground mt-1.5">
											Berikan nama yang jelas dan mudah dipahami untuk tipe laporan ini
										</p>
									)}
								</Field>
							</div>

							{/* Section 2: Template Configuration */}
							<SectionHeader
								icon={LayoutTemplateIcon}
								title="Konfigurasi Template"
								description="Pilih template yang akan digunakan untuk tipe laporan ini"
							/>
							<div className="pl-11">
								{/* Template Name Field */}
								<ReportTypeTemplateSelect value={data?.templateName ?? ""} errors={errors} />
							</div>

							{/* Section 3: Performance Formula */}
							<SectionHeader
								icon={FunctionSquareIcon}
								title="Formula Kinerja"
								description="Opsional: Tentukan formula untuk menghitung Kinerja keseluruhan"
							/>
							<div className="pl-11">
								<FormulaIndicator
									id="formula_performance"
									label="Formula Kinerja"
									errors={errors}
									value={data?.formulaPerformance ?? ""}
								/>
								{/* Formula Performance Field */}
							</div>
						</div>

						{/* Form Actions */}
						{Object.keys(errors).length > 0 && (
							<div className="mt-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
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
								<Link href={master.reportTypes().url}>
									<ArrowLeftIcon className="h-4 w-4" />
									Kembali ke Daftar
								</Link>
							</Button>
							<ButtonLoading processing={processing} />
						</div>
					</CardContent>
				</Card>
			)}
		</Form>
	);
});
ReportTypesForm.displayName = "ReportTypesForm";

export default ReportTypesForm;
