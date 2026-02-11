import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useDownloadPolling = (baseUrl: string, baseExportUrl: string) => {
	const [isExporting, setIsExporting] = useState(false);

	const pollExportStatus = useCallback(
		async (exportId: string): Promise<void> => {
			let attempts = 0;
			const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)

			const poll = async () => {
				try {
					const response = await fetch(`${baseExportUrl}/${exportId}/status`);

					if (!response.ok) {
						throw new Error(`Status check failed: ${response.status}`);
					}

					const data = await response.json();

					if (data.status === "completed") {
						// Download the file
						const downloadUrl = `${baseExportUrl}/${exportId}/download`;
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
		},
		[baseExportUrl],
	);

	const exportExcel = useCallback(
		async (filters: unknown) => {
			setIsExporting(true);
			toast.info("Memproses export...");

			try {
				const csrfToken = document.cookie
					.split(";")
					.find((cookie) => cookie.trim().startsWith("XSRF-TOKEN="))
					?.split("=")[1];

				if (!csrfToken) {
					throw new Error("XSRF-TOKEN cookie tidak ditemukan");
				}
				const decodedToken = decodeURIComponent(csrfToken);

				const formData = new FormData();

				Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
					if (value !== null && value !== undefined && value !== "") {
						formData.append(key, String(value));
					}
				});

				const response = await fetch(`${baseUrl}/export`, {
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
				toast.error(`Gagal melakukan export: ${error instanceof Error ? error.message : "Unknown error"}`);
				setIsExporting(false);
			}
		},
		[baseUrl, pollExportStatus],
	);

	return { exportExcel, isExporting };
};
