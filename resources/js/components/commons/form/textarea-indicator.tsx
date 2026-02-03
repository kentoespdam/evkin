import { InfoIcon } from "lucide-react";
import { memo } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import StarRequired from "../star-required";
import FormulaIndicatorTooltip from "../tooltip_formula_indicator";

interface FormulaIndicatorProps {
    id: string
    label: string;
    errors: Record<string, string>;
    value?: string;
}
const FormulaIndicator = memo(({ id, label, errors, value }: FormulaIndicatorProps) => {
    return (
        <Field>
            <FieldLabel htmlFor={id}>
                {label} <StarRequired />
                <FormulaIndicatorTooltip />
            </FieldLabel>
            <Textarea
                id={id}
                name={id}
                defaultValue={value}
                placeholder="Contoh: &#10;GTE 80; &#10;LTE 79;"
                className={cn(
                    "font-mono text-sm transition-all",
                    errors[id]
                        ? "border-destructive focus-visible:ring-destructive"
                        : "focus-visible:ring-primary/20",
                )}
                rows={4}
            />
            {errors[id] && (
                <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                    <InfoIcon className="h-3 w-3" />
                    {errors[id]}
                </p>
            )}
        </Field>
    );
});
FormulaIndicator.displayName = "FormulaIndicator";

export default FormulaIndicator;
