import { router } from "@inertiajs/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { monthsList, yearsList } from "@/lib/utils";
import report from "@/routes/report";
import type { PerhitunganReportFilters } from "@/types/perhitungan-reports";

const BASE_URL = report.perhitunganReports.detail.url();

export const usePerhitunganDetailFilter = () => {
	const { years, months } = useMemo(() => {
		const now = new Date();
		return {
			years: yearsList(now.getFullYear() - 5, now.getFullYear() + 1),
			months: monthsList(),
		};
	}, []);
	const [isExporting, setIsExporting] = useState(false);

	const updateAndVisit = useCallback((key: string, value: string) => {
		const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

		if (!value.trim()) {
			params.delete(key);
		} else {
			params.set(key, value);
		}

		// Reset aspect when report type changes
		if (key === "report_type_id") {
			params.delete("aspect_id");
		}

		// Changing filters should reset to first page
		params.delete("page");

		const qs = params.toString();
		const nextUrl = qs ? `${BASE_URL}?${qs}` : BASE_URL;

		router.visit(nextUrl, { preserveScroll: true, preserveState: true, replace: true });
	}, []);

	const resetAll = useCallback(() => {
		router.visit(BASE_URL, { preserveScroll: true, preserveState: false, replace: true });
	}, []);

	const exportExcel = useCallback(async (filters: PerhitunganReportFilters) => {
		if (!filters.report_type_id) {
			toast.error("Pilih Report Type terlebih dahulu");
			return;
		}

		setIsExporting(true);
		toast.info("Memproses export...");

		try {
			// Get CSRF token from XSRF-TOKEN cookie
			const csrfToken = document.cookie
				.split(";")
				.find((cookie) => cookie.trim().startsWith("XSRF-TOKEN="))
				?.split("=")[1];

			if (!csrfToken) {
				throw new Error("XSRF-TOKEN cookie tidak ditemukan");
			}

			// Decode the token if it's URL encoded
			const decodedToken = decodeURIComponent(csrfToken);

			const formData = new FormData();

			// Add filter data to FormData
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== null && value !== undefined && value !== "") {
					formData.append(key, String(value));
				}
			});

			const response = await fetch("/report/perhitungan-reports/detail/export", {
				method: "POST",
				headers: {
					"X-XSRF-TOKEN": decodedToken,
				},
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			// Get the filename from Content-Disposition header
			const contentDisposition = response.headers.get("Content-Disposition");
			let fileName = "perhitungan-reports-detail.xlsx";
			if (contentDisposition) {
				const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
				if (fileNameMatch) {
					fileName = decodeURIComponent(fileNameMatch[1]);
				}
			}

			// Convert response to blob and trigger download
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success("File Excel berhasil diunduh");
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Gagal mengunduh file Excel";
			toast.error(errorMessage);
			console.error("Export error:", error);
		} finally {
			setIsExporting(false);
		}
	}, []);

	return { years, months, updateAndVisit, resetAll, exportExcel, isExporting };
};
