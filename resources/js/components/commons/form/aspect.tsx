import { useMemo } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Aspect } from "@/types/aspect";

interface AspectSelectProps {
    aspects: Aspect[];
    errors: Record<string, string>;
    value?: string;
    reportTypeId?: string;
}
const AspectSelect = ({ aspects, errors, value, reportTypeId }: AspectSelectProps) => {
    const rows = useMemo(
        () =>
            aspects.filter((aspect) => {
                return aspect.reportType?.id === reportTypeId;
            }),
        [aspects, reportTypeId],
    );
    return (
        <Field>
            <FieldLabel htmlFor="aspect_id">
                Aspek <span className="text-destructive">*</span>
            </FieldLabel>
            <Select name="aspect_id" defaultValue={value}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Aspect" />
                </SelectTrigger>
                <SelectContent>
                    {rows.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.reportType?.name})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FieldError>{errors.aspect_id}</FieldError>
        </Field>
    );
};

export default AspectSelect;
