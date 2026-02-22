import { Head } from "@inertiajs/react";
import { TextCursorInputIcon } from "lucide-react";
import InputsForm from "@/components/master/form/inputs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { MasterSource } from "@/types/master-source";

interface MasterInputEditProps {
	data: MasterInput;
	sources: MasterSource[];
	aspects: Aspect[];
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Beranda",
		href: dashboard().url,
	},
	{
		title: "Master",
		href: "#",
	},
	{
		title: "Inputs",
		href: master.inputs().url,
	},
	{
		title: "Edit",
		href: "#",
	},
];

const MasterInputEdit = ({ data, sources, aspects }: MasterInputEditProps) => {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Edit Master Input`} />
			<div className="flex flex-col gap-6 p-4">
				{/* Header Card */}
				<Card className="border-primary/20">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<TextCursorInputIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">Edit Master Input</CardTitle>
								<CardDescription>Edit Master Input information</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				<InputsForm data={data} sources={sources} aspects={aspects} />
			</div>
		</AppLayout>
	);
};

export default MasterInputEdit;
