import { router } from "@inertiajs/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { yearsList } from "@/lib/utils";
import { perhitunganReports } from "@/routes/report";
import type { PerhitunganReportFilters } from "@/types/perhitungan-reports";

const BASE_URL = perhitunganReports.url();

export const usePerhitunganIndexFilter = () => {
	const years = useMemo(() => {
		const now = new Date();
		return yearsList(now.getFullYear() - 5, now.getFullYear() + 1);
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

	const pollExportStatus = useCallback(async (exportId: string): Promise<void> => {
		let attempts = 0;
		const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)

		const poll = async () => {
			try {
				const response = await fetch(`/report/perhitungan-reports/export/${exportId}/status`);

				if (!response.ok) {
					throw new Error(`Status check failed: ${response.status}`);
				}

				const data = await response.json();

				if (data.status === "completed") {
					// Download the file
					const downloadUrl = `/report/perhitungan-reports/export/${exportId}/download`;
					const link = document.createElement("a");
					link.href = downloadUrl;
					link.download = "";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					toast.success("File Excel berhasil diunduh");
					setIsExporting(false);
				} else if (data.status === "failed") {
					toast.error(`Export gagal: ${data.error || "Unknown error"}`);
					setIsExporting(false);
				} else if (data.status === "processing" || data.status === "pending") {
					attempts++;
					if (attempts >= maxAttempts) {
						toast.error("Export timeout. Silakan coba lagi.");
						setIsExporting(false);
					} else {
						// Continue polling
						setTimeout(poll, 5000); // Poll every 5 seconds
					}
				}
			} catch (error) {
				console.error("Polling error:", error);
				toast.error(`Gagal memeriksa status export: ${error instanceof Error ? error.message : "Unknown error"}`);
				setIsExporting(false);
			}
		};

		poll();
	}, []);

	const exportExcel = useCallback(
		async (filters: PerhitunganReportFilters) => {
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

				const response = await fetch("/report/perhitungan-reports/export", {
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

				const data = await response.json();

				if (data.export_id) {
					toast.success("Export dimulai. Mohon tunggu...");
					// Start polling for status
					pollExportStatus(data.export_id);
				} else {
					throw new Error("Export ID tidak ditemukan dalam response");
				}
			} catch (error) {
				console.error("Export error:", error);
				toast.error(`Gagal export: ${error instanceof Error ? error.message : "Unknown error"}`);
				setIsExporting(false);
			}
		},
		[pollExportStatus],
	);

	return { years, updateAndVisit, resetAll, exportExcel, isExporting };
};
