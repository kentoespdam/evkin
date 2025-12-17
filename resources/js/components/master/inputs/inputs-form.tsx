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
import { MasterInput } from "@/types/master-input";
import { MasterSource } from "@/types/master-source";
import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, TextCursorInputIcon } from "lucide-react";
import { useMemo } from "react";
interface InputsFormProps {
  sources: MasterSource[];
  data?: MasterInput;
}
const InputsForm = ({ data, sources }: InputsFormProps) => {
  const formAction = useMemo(() => {
    if (data?.id) {
      const form = master.inputs.update(data.id);

      return {
        action: form.url,
        method: form.method,
      };
    }
    const form = master.inputs.store();
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
                  <TextCursorInputIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Master Input Information
                  </h3>
                </div>

                {/* Kode Field */}
                <Field>
                  <FieldLabel htmlFor="kode">
                    Input Kode <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="kode"
                    name="kode"
                    type="text"
                    defaultValue={data?.kode}
                    placeholder="Enter input kode"
                    className={errors.kode ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.kode}</FieldError>
                </Field>

                {/* Description Field */}
                <Field>
                  <FieldLabel htmlFor="description">
                    Input Description{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={data?.description}
                    placeholder="Enter input description"
                    className={errors.description ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.description}</FieldError>
                </Field>

                {/* Master Source Field */}
                <Field>
                  <FieldLabel htmlFor="master_source_id">
                    Master Source <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    name="master_source_id"
                    defaultValue={data?.masterSource.id}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select master source"
                        className={
                          errors.master_source_id ? "border-destructive" : ""
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <span className="capitalize">{item.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.master_source_id}</FieldError>
                </Field>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="ghost" asChild>
                <Link href={master.inputs().url} className="gap-2">
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

export default InputsForm;
