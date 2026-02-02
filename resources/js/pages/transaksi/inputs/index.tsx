import { Head, router } from "@inertiajs/react";
import { AlertCircleIcon, PencilIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import TransaksiInputsTable from "@/components/transaksi/table/inputs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { monthsList, yearsList } from "@/lib/utils";
import { dashboard } from "@/routes";
import transaksi from "@/routes/transaksi";
import type { BreadcrumbItem } from "@/types";
import type { LockTransaksiInput } from "@/types/lock-transaksi-input";
import type { RoleInput } from "@/types/role-inputs";
import type { TransaksiInput, TransaksiInputFilter } from "@/types/transaksi-inputs";

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Dashboard",
		href: dashboard().url,
	},
	{
		title: "Transaksi",
		href: "#",
	},
	{
		title: "Inputs",
		href: "#",
	},
];

interface TransaksiInputsProps {
	page: RoleInput[];
	data: TransaksiInput[];
	locks: LockTransaksiInput[];
	filters: TransaksiInputFilter;
}

const TransaksiInputsFilter = memo(({ filters }: { filters: TransaksiInputFilter }) => {
	const { years, months } = useMemo(() => {
		const now = new Date();
		return {
			years: yearsList(now.getFullYear() - 5, now.getFullYear()),
			months: monthsList(),
		};
	}, []);

	const updateQueryAndVisit = useCallback((key: string, value: string) => {
		const params = new URLSearchParams(window.location.search);
		if (value === "") {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		const baseUrl = transaksi.inputs().url;
		const nextUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
		router.visit(nextUrl, {
			preserveState: true,
			preserveScroll: true,
		});
	}, []);

	const handleYearChange = useCallback(
		(value: string) => {
			updateQueryAndVisit("year", value);
		},
		[updateQueryAndVisit],
	);

	const handleMonthChange = useCallback(
		(value: string) => {
			updateQueryAndVisit("month", value);
		},
		[updateQueryAndVisit],
	);

	const handleInputChange = useDebouncedCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		updateQueryAndVisit("search", event.target.value);
	}, 300);

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
			{/* Year Input Selection */}
			<Field className="sm:col-span-1">
				<Select name="year" defaultValue={filters.year?.toString()} onValueChange={handleYearChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select year" />
					</SelectTrigger>
					<SelectContent>
						{years.map((year) => (
							<SelectItem key={year} value={year.toString()}>
								{year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>

			{/* Month Input Selection */}
			<Field className="sm:col-span-1">
				<Select name="month" defaultValue={filters.month?.toString()} onValueChange={handleMonthChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select month" />
					</SelectTrigger>
					<SelectContent>
						{months.map((month) => (
							<SelectItem key={month.value} value={month.value.toString()}>
								{month.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>

			{/* Search */}
			<Field className="sm:col-span-2">
				<Input
					name="search"
					defaultValue={filters.search}
					placeholder="Search indikator..."
					onChange={handleInputChange}
				/>
			</Field>
		</div>
	);
});
TransaksiInputsFilter.displayName = "TransaksiInputsFilter";

const TransaksiInputButton = memo(
	({
		isForm,
		setIsForm,
		disabled,
	}: {
		isForm: boolean;
		setIsForm: React.Dispatch<React.SetStateAction<boolean>>;
		disabled?: boolean;
	}) => {
		const toggleForm = useCallback(() => setIsForm((prev) => !prev), [setIsForm]);
		return isForm ? null : (
			<Button className={"gap-2"} onClick={toggleForm} disabled={disabled}>
				<PencilIcon />
				<span>Input Data</span>
			</Button>
		);
	},
);
TransaksiInputButton.displayName = "TransaksiInputButton";

const TransaksiInputs = ({ page, data, locks, filters }: TransaksiInputsProps) => {
	const [isForm, setIsForm] = useState(false);

	const isCurrentPeriodLocked = useMemo(() => {
		return locks?.some(
			(lock) => lock.year === parseInt(filters.year, 10) && lock.month === parseInt(filters.month, 10) && lock.isLocked,
		);
	}, [locks, filters.year, filters.month]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (!params.get("year") && !params.get("month")) {
			router.visit(transaksi.inputs().url, {
				data: {
					year: filters.year,
					month: filters.month,
				},
				preserveState: true,
				preserveScroll: true,
				replace: true,
			});
		}
	}, [filters.year, filters.month]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Transaksi Inputs" />
			<div className="flex flex-col gap-6 p-4">
				<Card>
					<CardHeader className="flex-row items-center justify-between space-y-0">
						<div className="space-y-1">
							<CardTitle className="text-xl">Inputs Management</CardTitle>
							<CardDescription>Manage your Transaksi Inputs</CardDescription>
						</div>
						<TransaksiInputButton isForm={isForm} setIsForm={setIsForm} disabled={isCurrentPeriodLocked} />
					</CardHeader>
					<CardContent className="space-y-4">
						<TransaksiInputsFilter filters={filters} />
						<Separator />
						{isCurrentPeriodLocked && (
							<Alert variant="destructive">
								<AlertCircleIcon />
								<AlertDescription>
									Periode {filters.month}/{filters.year} sudah dikunci. Data tidak dapat diubah.
								</AlertDescription>
							</Alert>
						)}
						<TransaksiInputsTable
							page={page}
							data={data}
							filters={filters}
							setIsForm={setIsForm}
							isForm={isForm}
							isLocked={isCurrentPeriodLocked}
						/>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
};

export default TransaksiInputs;
