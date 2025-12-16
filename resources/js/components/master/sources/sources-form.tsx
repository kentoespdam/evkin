import ButtonLoading from "@/components/commons/button-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import master from "@/routes/master";
import { MasterSource } from "@/types/master-source";
import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, NetworkIcon } from "lucide-react";
import { useMemo } from "react";

interface SourcesFormProps {
  source?: MasterSource;
}

const SourcesForm = ({ source }: SourcesFormProps) => {
  const formAction = useMemo(() => {
    if (source?.id) {
      const form = master.sources.update(source.id);

      return {
        action: form.url,
        method: form.method,
      };
    }
    const form = master.sources.store();
    return {
      action: form.url,
      method: form.method,
    };
  }, [source]);

  const StarRequired = () => {
    return <span className="text-destructive">*</span>;
  };

  return (
    <Form {...formAction} resetOnSuccess>
      {({ errors, processing }) => (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Role Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <NetworkIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Source Information
                  </h3>
                </div>

                {/* Name Field */}
                <Field>
                  <FieldLabel htmlFor="name">
                    Source Name {StarRequired()}
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={source?.name}
                    placeholder="Enter source name"
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
                <Link href={master.sources().url} className="gap-2">
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

export default SourcesForm;
