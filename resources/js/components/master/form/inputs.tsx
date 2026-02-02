import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, DatabaseIcon, FileDigitIcon, HashIcon, InfoIcon, RulerIcon, SparklesIcon } from "lucide-react";
import { memo, useMemo } from "react";
import ButtonLoading from "@/components/commons/button-loading";
import SectionHeader from "@/components/commons/section-header-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import master from "@/routes/master";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { MasterSource } from "@/types/master-source";

interface InputsFormProps {
	sources: MasterSource[];
	aspects: Aspect[];
	data?: MasterInput;
}

const FormHeader = memo(() => (
	<div className="flex items-center gap-3 pb-6 border-b mb-8">
		<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
			<SparklesIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
		</div>
		<div>
			<h3 className="font-semibold text-lg text-foreground">Master Input Configuration</h3>
			<p className="text-sm text-muted-foreground">Configure input indicators and data sources for reporting</p>
		</div>
	</div>
));
FormHeader.displayName = "FormHeader";

const InputsForm = ({ data, sources, aspects }: InputsFormProps) => {
	const formAction = useMemo(() => {
		if (data?.id) {
			const form = master.inputs.update(data.id);

			return {
				action: form.url,
				method: form.method,
			};
		}
		const form = master.inputs.store();
		return {
			action: form.url,
			method: form.method,
		};
	}, [data]);

	return (
		<Form {...formAction} resetOnSuccess>
			{({ errors, processing }) => (
				<Card className="border border-border/60 shadow-lg">
					<CardContent className="pt-6 pb-8">
						<FormHeader />

						<div className="space-y-4">
							{/* Section 1: Sequence */}
							<Field className="rounded-xl border bg-muted/10 p-4">
								<SectionHeader
									htmlFor="seq"
									icon={HashIcon}
									title="Urutan"
									description="Tentukan urutan tampilan input dalam sistem"
								/>
								<FieldContent className="pl-11">
									<Input
										id="seq"
										name="seq"
										type="number"
										defaultValue={data?.seq ?? 0}
										placeholder="0"
										className={cn(
											"transition-all w-full sm:w-1/2",
											errors.seq
												? "border-destructive focus-visible:ring-destructive"
												: "focus-visible:ring-emerald-500/20",
										)}
									/>
									{errors.seq && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.seq}
										</p>
									)}
									{!errors.seq && (
										<p className="text-xs text-muted-foreground mt-1.5">
											Nomor urut untuk mengatur tampilan input (default: 0)
										</p>
									)}
								</FieldContent>
							</Field>

							{/* Section 1.5: Aspect */}
							<Field className="rounded-xl border bg-muted/10 p-4">
								<SectionHeader
									htmlFor="aspect_id"
									icon={SparklesIcon}
									title="Aspek"
									description="Pilih aspek untuk input ini"
								/>
								<FieldContent className="pl-11">
									<Select name="aspect_id" defaultValue={data?.aspect?.id ?? ""}>
										<SelectTrigger
											className={cn(
												"transition-all",
												errors.aspect_id
													? "border-destructive focus-visible:ring-destructive"
													: "focus-visible:ring-emerald-500/20",
											)}
										>
											<SelectValue placeholder="Pilih aspek" />
										</SelectTrigger>
										<SelectContent>
											{aspects.map((item) => (
												<SelectItem key={item.id} value={item.id} className="space-x-2">
													<Badge>{item.reportType.name}</Badge>
													<span className="capitalize">{item.name}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.aspect_id && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.aspect_id}
										</p>
									)}
									{!errors.aspect_id && (
										<p className="text-xs text-muted-foreground mt-1.5">Pilih aspek yang sesuai dengan input ini</p>
									)}
								</FieldContent>
							</Field>

							{/* Section 2: Code Information */}
							<Field className="rounded-xl border bg-muted/10 p-4">
								<SectionHeader
									htmlFor="kode"
									icon={FileDigitIcon}
									title="Kode Input"
									description="Kode unik untuk identifikasi input dalam sistem"
								/>
								<FieldContent className="pl-11">
									<Input
										id="kode"
										name="kode"
										type="text"
										defaultValue={data?.kode}
										placeholder="Contoh: IN001, KPI_01"
										className={cn(
											"font-mono transition-all",
											errors.kode
												? "border-destructive focus-visible:ring-destructive"
												: "focus-visible:ring-emerald-500/20",
										)}
										required
									/>
									{errors.kode && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.kode}
										</p>
									)}
									{!errors.kode && (
										<p className="text-xs text-muted-foreground mt-1.5">
											Gunakan format yang konsisten dan mudah dikenali
										</p>
									)}
								</FieldContent>
							</Field>

							{/* Section 3: Indicator Details */}
							<Field className="rounded-xl border bg-muted/10 p-4">
								<SectionHeader
									htmlFor="description"
									icon={FileDigitIcon}
									title="Detail Indikator"
									description="Deskripsi lengkap dan satuan pengukuran untuk input"
								/>
								<FieldContent className="pl-11 space-y-4">
									{/* Description Field */}
									<Textarea
										id="description"
										name="description"
										defaultValue={data?.description}
										placeholder="Contoh: Jumlah kegiatan pelatihan yang dilaksanakan&#10;Persentase pencapaian target kinerja"
										className={cn(
											"transition-all min-h-[96px]",
											errors.description
												? "border-destructive focus-visible:ring-destructive"
												: "focus-visible:ring-emerald-500/20",
										)}
										required
										rows={3}
									/>
									{errors.description && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.description}
										</p>
									)}
									{!errors.description && (
										<p className="text-xs text-muted-foreground mt-1.5">
											Jelaskan dengan detail apa yang diukur oleh indikator ini
										</p>
									)}
								</FieldContent>
							</Field>

							{/* Section 4: Data Source */}
							<div className="grid gap-6 md:grid-cols-2">
								<Field className="rounded-xl border bg-muted/10 p-4">
									<SectionHeader
										htmlFor="master_source_id"
										icon={DatabaseIcon}
										title="Sumber Data"
										description="Pilih sumber data yang akan digunakan untuk input ini"
									/>
									<FieldContent className="pl-11">
										<div>
											<Select name="master_source_id" defaultValue={data?.masterSource.id}>
												<SelectTrigger
													className={cn(
														"transition-all",
														errors.master_source_id
															? "border-destructive focus-visible:ring-destructive"
															: "focus-visible:ring-emerald-500/20",
													)}
												>
													<SelectValue placeholder="Pilih sumber data" />
												</SelectTrigger>
												<SelectContent>
													{sources.map((item) => (
														<SelectItem key={item.id} value={item.id}>
															<span className="capitalize">{item.name}</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{errors.master_source_id && (
												<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
													<InfoIcon className="h-3 w-3" />
													{errors.master_source_id}
												</p>
											)}
											{!errors.master_source_id && (
												<p className="text-xs text-muted-foreground mt-1.5">
													Pilih sumber data yang relevan untuk input ini
												</p>
											)}
										</div>
									</FieldContent>
								</Field>

								{/* Satuan Field */}
								<Field className="rounded-xl border bg-muted/10 p-4">
									<SectionHeader
										htmlFor="satuan"
										icon={RulerIcon}
										title="Satuan"
										description="Tentukan satuan pengukuran untuk input ini"
									/>
									<FieldContent className="pl-11">
										<Input
											id="satuan"
											name="satuan"
											defaultValue={data?.satuan}
											placeholder="Contoh: orang, %, unit, Rp"
											className={cn(
												"transition-all",
												errors.satuan
													? "border-destructive focus-visible:ring-destructive"
													: "focus-visible:ring-emerald-500/20",
											)}
											required
										/>
										{errors.satuan && (
											<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
												<InfoIcon className="h-3 w-3" />
												{errors.satuan}
											</p>
										)}
										{!errors.satuan && (
											<p className="text-xs text-muted-foreground mt-1.5">
												Tentukan unit pengukuran yang sesuai (angka, persentase, mata uang, dll)
											</p>
										)}
									</FieldContent>
								</Field>
							</div>

							{/* Section 5: Formula */}
							<Field className="rounded-xl border bg-muted/10 p-4">
								<SectionHeader
									htmlFor="formula"
									icon={FileDigitIcon}
									title="Formula"
									description="Rumus perhitungan untuk input ini (SUM / LAST)"
								/>
								<FieldContent className="pl-11">
									<RadioGroup
										orientation="vertical"
										name="formula"
										defaultValue={data?.formula ?? "SUM"}
										className="flex flex-wrap gap-4"
									>
										<div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-2 shadow-sm">
											<RadioGroupItem
												value="SUM"
												id="SUM"
												className="data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-600"
											/>
											<Label htmlFor="SUM" className="font-medium">
												SUM
											</Label>
										</div>
										<div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-2 shadow-sm">
											<RadioGroupItem
												value="LAST"
												id="LAST"
												className="data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-600"
											/>
											<Label htmlFor="LAST" className="font-medium">
												LAST
											</Label>
										</div>
										<div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-2 shadow-sm">
											<RadioGroupItem
												value="MAX"
												id="MAX"
												className="data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-600"
											/>
											<Label htmlFor="MAX" className="font-medium">
												MAX
											</Label>
										</div>
									</RadioGroup>
									{errors.formula && (
										<p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
											<InfoIcon className="h-3 w-3" />
											{errors.formula}
										</p>
									)}
									{!errors.formula && (
										<p className="text-xs text-muted-foreground mt-1.5">Pilih formula perhitungan jika diperlukan</p>
									)}
								</FieldContent>
							</Field>
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
								<Link href={master.inputs().url}>
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

export default InputsForm;
