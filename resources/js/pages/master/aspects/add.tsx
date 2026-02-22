import { Head } from "@inertiajs/react";
import { TextCursorInputIcon } from "lucide-react";
import AspectsForm from "@/components/master/form/aspects";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";
import type { ReportType } from "@/types/report-type";

interface AspectsAddProps {
	reportTypes: ReportType[];
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
		title: "Aspek",
		href: master.aspects().url,
	},
	{
		title: "Tambah",
		href: "#",
	},
];

const AspectsAdd = ({ reportTypes }: AspectsAddProps) => {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Tambah Aspek Master`} />
			<div className="flex flex-col gap-6 p-4">
				{/* Kartu Header */}
				<Card className="border-primary/20">
					<CardHeader className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<TextCursorInputIcon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-2xl">Tambah Aspek Master</CardTitle>
								<CardDescription>Tambah informasi Aspek Master baru</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				<AspectsForm reportTypes={reportTypes} />
			</div>
		</AppLayout>
	);
};

export default AspectsAdd;
