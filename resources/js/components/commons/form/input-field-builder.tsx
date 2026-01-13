import { memo } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputFormFieldBuilderProps {
    id: string;
    name: string;
    label: string;
    required?: boolean;
    defaultValue?: string | number;
    error?: string;
    placeholder?: string;
    type?: string;
    children?: React.ReactNode;
    className?: string;
    step?: string;
}
const InputFormFieldBuilder = memo(
    ({
        id,
        name,
        label,
        required = false,
        defaultValue,
        error,
        placeholder,
        type = "text",
        children,
        className,
        step,
    }: InputFormFieldBuilderProps) => (
        <Field>
            <FieldLabel htmlFor={id}>
                {label} {required && <span className="text-destructive">*</span>}
            </FieldLabel>

            {children ||
                (type === "textarea" ? (
                    <Textarea
                        id={id}
                        name={name}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        className={cn(error && "border-destructive", className)}
                        required={required}
                    />
                ) : (
                    <Input
                        id={id}
                        name={name}
                        type={type}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        className={cn(error && "border-destructive", className)}
                        required={required}
                        step={step}
                    />
                ))}

            {error && <FieldError>{error}</FieldError>}
        </Field>
    ),
);
InputFormFieldBuilder.displayName = "InputFormFieldBuilder";

export default InputFormFieldBuilder;
