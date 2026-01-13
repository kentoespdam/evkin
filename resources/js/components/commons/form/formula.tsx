import { useRef } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { MasterInput } from "@/types/master-input";
import AvailableCodeButton from "../available-code-button";

interface FormulaTextAreaProps {
    availableCode: MasterInput[];
    errors: Record<string, string>;
    value?: string;
}
const FormulaTextArea = ({ availableCode, errors, value }: FormulaTextAreaProps) => {
    const formulaRef = useRef<HTMLTextAreaElement>(null);
    return (
        <div className="grid gap-4">
            <Field>
                <FieldLabel htmlFor="formula">
                    Formula <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                    id="formula"
                    name="formula"
                    defaultValue={value}
                    placeholder="Enter input formula"
                    className={errors.formula ? "border-destructive" : ""}
                    ref={formulaRef}
                />
                <FieldError>{errors.formula}</FieldError>
            </Field>

            <AvailableCodeButton availableCode={availableCode} formulaRef={formulaRef} currentCode={value || ""} />
        </div>
    );
};

export default FormulaTextArea;
