import ButtonLoading from "@/components/commons/button-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import master from "@/routes/master";
import { ReportType } from "@/types/report-types";
import { Report } from "@/types/reports";
import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { useRef, useMemo } from "react";
import AvailableCodeButton from "./available-code-button";
import { MasterInput } from "@/types/master-input";

interface ReportsFormProps {
  reportType: ReportType[];
  availableCode: MasterInput[];
  data?: Report;
}

const ReportsForm = ({ reportType, availableCode, data }: ReportsFormProps) => {
  const formAction = useMemo(() => {
    if (data?.id) {
      const form = master.reports.update(data.id);

      return {
        action: form.url,
        method: form.method,
      };
    }
    const form = master.reports.store();
    return {
      action: form.url,
      method: form.method,
    };
  }, [data]);

  const formulaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Form {...formAction} resetOnSuccess>
      {({ errors, processing }) => (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Master Input Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Master Report Information
                  </h3>
                </div>

                {/* Urut Field */}
                <Field>
                  <FieldLabel htmlFor="urut">
                    Urut <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="urut"
                    name="urut"
                    type="number"
                    defaultValue={data?.urut ?? 1}
                    placeholder="Enter urut"
                    className={errors.urut ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.urut}</FieldError>
                </Field>

                {/* Report Type Field */}
                <Field>
                  <FieldLabel htmlFor="report_type_id">
                    Report Type <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    name="report_type_id"
                    defaultValue={data?.reportType?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportType.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.report_type_id}</FieldError>
                </Field>

                {/* Description Indicator Field */}
                <Field>
                  <FieldLabel htmlFor="descIndicator">
                    Description Indicator{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="descIndicator"
                    name="descIndicator"
                    type="text"
                    defaultValue={data?.descIndicator}
                    placeholder="Enter input indicator"
                    className={errors.descIndicator ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.descIndicator}</FieldError>
                </Field>

                {/* Description Formula Field */}
                <Field>
                  <FieldLabel htmlFor="descFormula">
                    Description Formula{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="descFormula"
                    name="descFormula"
                    defaultValue={data?.descFormula}
                    placeholder="Enter input formula"
                    className={errors.descFormula ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.descFormula}</FieldError>
                </Field>

                {/* Satuan Field */}
                <Field>
                  <FieldLabel htmlFor="unit">
                    Satuan <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="unit"
                    name="unit"
                    type="text"
                    defaultValue={data?.unit}
                    placeholder="Enter unit"
                    className={errors.unit ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.unit}</FieldError>
                </Field>

                {/* Bobot Field */}
                <Field>
                  <FieldLabel htmlFor="weight">
                    Bobot <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="weight"
                    name="weight"
                    type="text"
                    defaultValue={data?.weight}
                    placeholder="Enter weight"
                    className={errors.weight ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.weight}</FieldError>
                </Field>

                {/* Formula Field */}
                <Field>
                  <FieldLabel htmlFor="formula">
                    Formula <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="formula"
                    name="formula"
                    defaultValue={data?.formula}
                    placeholder="Enter input formula"
                    className={errors.formula ? "border-destructive" : ""}
                    ref={formulaRef}
                  />
                  <FieldError>{errors.formula}</FieldError>
                </Field>
                <AvailableCodeButton
                  availableCode={availableCode}
                  formulaRef={formulaRef}
                  currentCode={data?.formula}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="ghost" asChild>
                <Link href={master.reports().url} className="gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <ButtonLoading processing={processing} />
            </div>
          </CardContent>
        </Card>
      )}
    </Form>
  );
};

export default ReportsForm;
