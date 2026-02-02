import { memo } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface YearSelectProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    years: number[];
}
const YearSelectFilter = memo(({ label, value, onChange, years }: YearSelectProps) => (
    <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground whitespace-nowrap">{label}</Label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[140px]">
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
    </div>
));

YearSelectFilter.displayName = "YearSelectFilter";

export default YearSelectFilter;