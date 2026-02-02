import { Head } from "@inertiajs/react";
import { TextCursorInputIcon } from "lucide-react";
import AspectsForm from "@/components/master/form/aspects";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { ReportType } from "@/types/report-type";

interface AspectEditProps {
	reportTypes: ReportType[];
	aspect: Aspect;
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Dashboard",
		href: dashboard().url,
	},
	{
		title: "Master",
		href: "#",
	},
	{
		title: "Aspects",
		href: master.aspects().url,
	},
	{
		title: "Add",
		href: "#",
	},
];

const AspectsEdit = ({ reportTypes, aspect }: AspectEditProps) => {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Edit Master Aspect`} />
			<div className="flex flex-col gap-6 p-4">
				{/* Header Card */}
				<Card className="border-primary/20">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<TextCursorInputIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">Edit Master Aspect</CardTitle>
								<CardDescription>Edit existing Master Aspect information</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				<AspectsForm data={aspect} reportTypes={reportTypes} />
			</div>
		</AppLayout>
	);
};

export default AspectsEdit;
