import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, FileTypeIcon, FunctionSquareIcon, InfoIcon, SparklesIcon, TagIcon } from "lucide-react";
import { memo, useMemo } from "react";
import ButtonLoading from "@/components/commons/button-loading";
import ReportTypeSelect from "@/components/commons/form/report-type";
import FormulaIndicatorTooltip from "@/components/commons/tooltip_formula_indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import master from "@/routes/master";
import type { Aspect } from "@/types/aspect";
import type { ReportType } from "@/types/report-types";

interface AspectsFormProps {
	reportTypes: ReportType[];
	data?: Aspect;
}

const FormHeader = memo(() => (
	<div className="flex items-center gap-3 pb-6 border-b mb-8">
		<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
			<SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
		</div>
		<div>
			<h3 className="font-semibold text-lg text-foreground">Master Aspect Configuration</h3>
			<p className="text-sm text-muted-foreground">Configure aspect settings and formulas for report types</p>
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

const AspectsForm = ({ data, reportTypes }: AspectsFormProps) => {
	const formAction = useMemo(() => {
		if (data?.id) {
			const form = master.aspects.update(data.id);

			return {
				action: form.url,
				method: form.method,
			};
		}
		const form = master.aspects.store();
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
								icon={FileTypeIcon}
								title="Informasi Dasar"
								description="Pilih tipe laporan untuk mengkategorikan aspek ini"
							/>
							<div className="pl-11">
								{/* Report Type Field */}
								<ReportTypeSelect value={data?.reportType?.id} reportTypes={reportTypes} errors={errors} />
							</div>

							{/* Section 2: Aspect Details */}
							<SectionHeader
								icon={TagIcon}
								title="Detail Aspek"
								description="Tentukan nama aspek yang akan digunakan dalam pelaporan"
							/>
							<div className="pl-11 space-y-4">
								{/* Name Field */}
								<Field>
									<FieldLabel htmlFor="name" className="flex items-center gap-2">
										Aspect Name <span className="text-destructive">*</span>
										<span className="text-xs text-muted-foreground font-normal">(Wajib diisi)</span>
									</FieldLabel>
									<Input
										id="name"
										name="name"
										type="text"
										defaultValue={data?.name}
										placeholder="Contoh: Aspek Keuangan, Aspek Operasional"
										className={cn(
											"transition-all",
											errors.name
												? "border-destructive focus-visible:ring-destructive"
												: "focus-visible:ring-purple-500/20",
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
											Berikan nama yang jelas dan mudah dipahami untuk aspek ini
										</p>
									)}
								</Field>
							</div>

							{/* Section 3: Formula Configuration */}
							<SectionHeader
								icon={FunctionSquareIcon}
								title="Konfigurasi Formula"
								description="Opsional: Tentukan formula khusus untuk perhitungan aspek ini"
							/>
							<div className="pl-11">
								{/* Formula Aspect Field */}
								<Field>
									<FieldLabel htmlFor="formula_aspect" className="flex items-center gap-2">
										Formula Aspect
										<FormulaIndicatorTooltip />
									</FieldLabel>
									<Textarea
										id="formula_aspect"
										name="formula_aspect"
										defaultValue={data?.formulaAspect ?? ""}
										placeholder="Contoh: &#10;GTE 80; &#10;LTE 79;"
										className={cn(
											"font-mono text-sm transition-all min-h-[100px]",
											errors.formula_aspect
												? "border-destructive focus-visible:ring-destructive"
												: "focus-visible:ring-purple-500/20",
										)}
										rows={4}
									/>
									{errors.formula_aspect && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.formula_aspect}
										</p>
									)}
								</Field>
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
								<Link href={master.aspects().url}>
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
};

export default AspectsForm;
