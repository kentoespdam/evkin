import { Head } from "@inertiajs/react";
import { FileTextIcon } from "lucide-react";
import ReportsForm from "@/components/master/form/reports";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { ReportType } from "@/types/report-type";

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
		title: "Reports",
		href: master.reports().url,
	},
	{
		title: "Tambah",
		href: "#",
	},
];

interface MasterReportAddProps {
	reportTypes: ReportType[];
	availableCode: MasterInput[];
	aspects: Aspect[];
}

const MasterReportAdd = ({ reportTypes, availableCode, aspects }: MasterReportAddProps) => {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Add Master Report`} />
			<div className="flex flex-col gap-6 p-4">
				{/* Header Card */}
				<Card className="border-primary/20">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<FileTextIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">Add Master Report</CardTitle>
								<CardDescription>Add new Master Report information</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				<ReportsForm reportTypes={reportTypes} availableCode={availableCode} aspects={aspects} />
			</div>
		</AppLayout>
	);
};

export default MasterReportAdd;
