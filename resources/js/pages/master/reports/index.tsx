import { Head, Link, router } from "@inertiajs/react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import ReportsTable from "@/components/master/table/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalDeleteHook } from "@/hooks/use-global-delete-hook";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { ReportType } from "@/types/report-type";
import type { Report, ReportFilters } from "@/types/reports";

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
		title: "Reports",
		href: "#",
	},
];

interface MasterReportsProps {
	page: Pagination<Report>;
	reportTypes: ReportType[];
	aspects: Aspect[];
	filters: ReportFilters;
}

// Memisahkan logika filter ke custom hook untuk separation of concerns
const useReportsFilter = (filters: ReportFilters) => {
	const { search, reportTypeId, aspectId } = filters;

	const updateQueryAndVisit = useCallback((key: string, value: string) => {
		const params = new URLSearchParams(window.location.search);
		params.delete("page"); // Reset pagination on filter change
		params.delete("per_page");

		if (!value.trim()) {
			params.delete(key);
		} else {
			params.set(key, value);
		}

		// Hapus aspectId jika reportTypeId diubah
		if (key === "reportTypeId") {
			params.delete("aspectId");
		}

		const baseUrl = master.reports().url;
		const queryString = params.toString();
		const nextUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

		router.visit(nextUrl, {
			preserveState: true,
			preserveScroll: true,
		});
	}, []);

	const handleSearchChange = useDebouncedCallback((value: string) => {
		updateQueryAndVisit("search", value);
	}, 300);

	const handleReportTypeChange = useCallback(
		(value: string) => {
			updateQueryAndVisit("reportTypeId", value);
		},
		[updateQueryAndVisit],
	);

	const handleAspectChange = useCallback(
		(value: string) => {
			updateQueryAndVisit("aspectId", value);
		},
		[updateQueryAndVisit],
	);

	const handleResetFilters = useCallback(() => {
		router.visit(master.reports().url, {
			preserveState: false,
			preserveScroll: true,
		});
	}, []);

	return {
		search,
		reportTypeId,
		aspectId,
		handleSearchChange,
		handleReportTypeChange,
		handleAspectChange,
		handleResetFilters,
	};
};

// Komponen Select yang dipisahkan untuk reusability
const ReportTypeSelect = memo(
	({
		reportTypes,
		value,
		onChange,
	}: {
		reportTypes: ReportType[];
		value: string;
		onChange: (value: string) => void;
	}) => (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-fit">
				<SelectValue placeholder="Filter by Report Type" />
			</SelectTrigger>
			<SelectContent>
				{reportTypes.map((item) => (
					<SelectItem key={item.id} value={item.id}>
						{item.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	),
);

ReportTypeSelect.displayName = "ReportTypeSelect";

const AspectSelect = memo(
	({
		aspects,
		reportTypeId,
		value,
		onChange,
	}: {
		aspects: Aspect[];
		reportTypeId?: string;
		value: string;
		onChange: (value: string) => void;
	}) => {
		const filteredAspects = useMemo(() => {
			if (!reportTypeId) return [];
			return aspects.filter((aspect) => aspect.reportType?.id === reportTypeId);
		}, [aspects, reportTypeId]);

		const placeholder = reportTypeId ? "Filter by Aspect" : "Select Report Type first";

		return (
			<Select value={value} onValueChange={onChange} disabled={!reportTypeId}>
				<SelectTrigger className="w-fit">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{filteredAspects.map((item) => (
						<SelectItem key={item.id} value={item.id}>
							{item.name} ({item.reportType?.name})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	},
);

AspectSelect.displayName = "AspectSelect";

const ReportsFilter = memo(({ page, reportTypes, aspects, filters }: MasterReportsProps) => {
	const {
		search,
		reportTypeId,
		aspectId,
		handleSearchChange,
		handleReportTypeChange,
		handleAspectChange,
		handleResetFilters,
	} = useReportsFilter(filters);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-2">
				<Input
					name="search"
					placeholder="Search Indicator"
					className="sm:w-[250px]"
					defaultValue={search ?? ""}
					onChange={(e) => handleSearchChange(e.target.value)}
					aria-label="Search reports"
				/>

				<div className="flex flex-wrap gap-2">
					<ReportTypeSelect reportTypes={reportTypes} value={reportTypeId ?? ""} onChange={handleReportTypeChange} />

					<AspectSelect
						aspects={aspects}
						reportTypeId={reportTypeId}
						value={aspectId ?? ""}
						onChange={handleAspectChange}
					/>

					<Button onClick={handleResetFilters} className="gap-2" aria-label="Reset filters">
						<RefreshCwIcon className="size-4" />
						Reset
					</Button>
				</div>
			</div>

			<TableShowTotalText page={page} tableName="reports" className="justify-end sm:justify-end" />
		</div>
	);
});

ReportsFilter.displayName = "ReportsFilter";

const MasterReports = ({ page, reportTypes, aspects, filters }: MasterReportsProps) => {
	const { id, setId, showDeleteDialog, setShowDeleteDialog } = useGlobalDeleteHook();

	const formUrl = useMemo(() => master.reports.destroy(id).url, [id]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Master Reports" />

			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold">Reports Management</CardTitle>
							<CardDescription>Manage your Master Reports</CardDescription>
						</div>

						<Button asChild className="gap-2">
							<Link href={master.reports.add().url}>
								<PlusIcon className="h-4 w-4" />
								Add Master Report
							</Link>
						</Button>
					</CardHeader>

					<CardContent className="space-y-6">
						<ReportsFilter page={page} reportTypes={reportTypes} aspects={aspects} filters={filters} />

						<ReportsTable page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />

						<PaginationNav page={page} />
					</CardContent>
				</Card>
			</div>

			<DeleteDialog
				formAction={formUrl}
				showDeleteDialog={showDeleteDialog}
				setShowDeleteDialog={setShowDeleteDialog}
			/>
		</AppLayout>
	);
};

export default MasterReports;
