import { memo } from "react";
import { FieldLabel } from "../ui/field";
import OptionalField from "./optional-field";
import StarRequired from "./star-required";

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    required?: boolean;
    htmlFor?: string;
    description?: string;
}

const SectionHeader = memo(({ icon: Icon, title, required, htmlFor, description }: SectionHeaderProps) => (
    <FieldLabel htmlFor={htmlFor} className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
            <h4 className="font-medium text-sm text-foreground">
                {title} {required ? <StarRequired /> : <OptionalField />}
            </h4>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
    </FieldLabel>
));
SectionHeader.displayName = "SectionHeader";
export default SectionHeader;
