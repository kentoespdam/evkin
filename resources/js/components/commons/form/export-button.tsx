import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react";
import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
    isExporting: boolean;
    onExport: () => void;
    disabled: boolean;
    isEmpty: boolean;
}
const ExportButton = memo(({
    isExporting,
    onExport,
    disabled,
    isEmpty = true,
}: ExportButtonProps) => {
    const buttonText = useMemo(() => {
        if (isExporting) return "Menyiapkan File...";
        return `Export Excel ${!isEmpty ? "Spreadsheet" : ""}`;
    }, [isExporting, isEmpty]);

    const buttonIcon = useMemo(() => {
        if (isExporting) return null;
        return !isEmpty ?
            <FileSpreadsheetIcon className="h-4 w-4 mr-2" /> :
            <DownloadIcon className="h-4 w-4 mr-2" />;
    }, [isExporting, isEmpty]);
    return (
        <Button
            onClick={onExport}
            disabled={disabled || isExporting}
            size="sm"
            variant="outline"
            className="gap-2"
            aria-label="Export to Excel"
        >
            {buttonIcon}
            {buttonText}
            {isExporting && (
                <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
        </Button>
    );
});
ExportButton.displayName = "ExportButton";

export default ExportButton;