import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, TextCursorInputIcon } from "lucide-react";
import { useMemo } from "react";
import ButtonLoading from "@/components/commons/button-loading";
import ReportTypeSelect from "@/components/commons/form/report-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import master from "@/routes/master";
import type { Aspect } from "@/types/aspect";
import type { ReportType } from "@/types/report-types";

interface AspectsFormProps {
	reportTypes: ReportType[];
	data?: Aspect;
}
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
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-6">
							{/* Master Aspect Information Section */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 pb-2 border-b">
									<TextCursorInputIcon className="h-4 w-4 text-muted-foreground" />
									<h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
										Master Aspect Information
									</h3>
								</div>

								{/* Name Field */}
								<Field>
									<FieldLabel htmlFor="name">
										Aspect Name <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id="name"
										name="name"
										type="text"
										defaultValue={data?.name}
										placeholder="Enter aspect name"
										className={errors.name ? "border-destructive" : ""}
										required
									/>
									<FieldError>{errors.name}</FieldError>
								</Field>

								{/* Report Type Field */}
								<ReportTypeSelect
									value={data?.reportType?.id}
									reportTypes={reportTypes}
									errors={errors}
								/>
							</div>
						</div>
						{/* Form Actions */}
						<div className="flex items-center justify-between pt-4">
							<Button type="button" variant="ghost" asChild>
								<Link href={master.aspects().url} className="gap-2">
									<ArrowLeftIcon className="h-4 w-4" />
									Cancel
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
