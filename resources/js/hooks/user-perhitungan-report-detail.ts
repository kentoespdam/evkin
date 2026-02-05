import { router } from "@inertiajs/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import report from "@/routes/report";
import type { PerhitunganReportFilters } from "@/types/perhitungan-reports";

const BASE_URL=report.perhitunganReports.detail.url();
const EXPORT_ENDPOINT=report.perhitunganReports.detail.export.url();
const EXPORT_TIMEOUT=30000; // 30 seconds

export const usePerhitunganDetailFilter = () => {
    const updateAndVisit = useCallback(
        (key: string, value: string) => {
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
        },
        [],
    );

    const resetAll = useCallback(() => {
        router.visit(BASE_URL, { preserveScroll: true, preserveState: false, replace: true });
    }, []);

    

    return { updateAndVisit, resetAll };
};

export const useExportHandler = (filters?: PerhitunganReportFilters) => {
  const [isExporting, setIsExporting] = useState(false);
  const exportTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleExport = useCallback(() => {
    if (!filters) {
      toast.error("Filter tidak lengkap");
      return;
    }

    // Prevent multiple exports
    if (isExporting) {
      toast.warning("Export sedang diproses...");
      return;
    }

    setIsExporting(true);
    toast.info("Memulai proses export...");

    // Set timeout to prevent hanging
    exportTimeoutRef.current = setTimeout(() => {
      if (isExporting) {
        setIsExporting(false);
        toast.error("Export timeout. Silakan coba lagi.");
      }
    }, EXPORT_TIMEOUT);

    router.post(
      EXPORT_ENDPOINT,
      filters ? filters : {},
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          clearTimeout(exportTimeoutRef.current!);
          toast.success("File Excel berhasil di-generate dan akan segera didownload");
          setIsExporting(false);
        },
        onError: (errors) => {
          clearTimeout(exportTimeoutRef.current!);
          const errorMessages = Object.values(errors);
          const errorMessage = errorMessages.length > 0 
            ? String(errorMessages[0]) 
            : "Gagal export file. Silakan coba lagi.";
          
          toast.error(errorMessage);
          setIsExporting(false);
        },
        onFinish: () => {
          // Cleanup timeout
          if (exportTimeoutRef.current) {
            clearTimeout(exportTimeoutRef.current);
          }
        },
      },
    );
  }, [filters, isExporting]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current);
    }
  }, []);

  return { isExporting, handleExport, cleanup };
};
