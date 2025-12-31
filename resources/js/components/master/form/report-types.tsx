import ButtonLoading from "@/components/commons/button-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import master from "@/routes/master";
import { ReportType } from "@/types/report-types";
import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, FileTypeIcon } from "lucide-react";
import { memo, useMemo } from "react";

interface ReportTypesFormProps {
  data?: ReportType;
}

const ReportTypesForm = memo(({ data }: ReportTypesFormProps) => {
  const formAction = useMemo(() => {
    if (data?.id) {
      const form = master.reportTypes.update(data.id);

      return {
        action: form.url,
        method: form.method,
      };
    }
    const form = master.reportTypes.store();
    return {
      action: form.url,
      method: form.method,
    };
  }, [data]);

  return (
    <Form {...formAction} resetOnSuccess>
      {({ errors, processing }) => (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Master Input Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileTypeIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Master Report Type Information
                  </h3>
                </div>

                {/* Name Field */}
                <Field>
                  <FieldLabel htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={data?.name}
                    placeholder="Enter input name"
                    className={errors.name ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="ghost" asChild>
                <Link href={master.reportTypes().url} className="gap-2">
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
});
ReportTypesForm.displayName = "ReportTypesForm";

export default ReportTypesForm;
