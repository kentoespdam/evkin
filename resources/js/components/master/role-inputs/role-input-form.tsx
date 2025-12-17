import ButtonLoading from "@/components/commons/button-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import master from "@/routes/master";
import { MasterInput } from "@/types/master-input";
import { Role } from "@/types/role";
import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, KeyIcon } from "lucide-react";
import { useMemo } from "react";

interface RoleInputFormProps {
  roles: Role[];
  inputs: MasterInput[];
  data?: {
    id: string;
    role: Role;
    existingInputIds?: string[];
  };
}

const RoleInputForm = ({ roles, inputs, data }: RoleInputFormProps) => {
  const formAction = useMemo(() => {
    if (data?.id) {
      const form = master.roleInputs.update(data.id);

      return {
        action: form.url,
        method: form.method,
      };
    }
    const form = master.roleInputs.store();
    return {
      action: form.url,
      method: form.method,
    };
  }, [data]);

  const StarRequired = () => {
    return <span className="text-destructive">*</span>;
  };

  return (
    <Form {...formAction} resetOnSuccess>
      {({ errors, processing }) => (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Role Input Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <KeyIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Role Input Information
                  </h3>
                </div>

                {/* Role Field */}
                <Field>
                  <FieldLabel htmlFor="role_id">
                    Role {StarRequired()}
                  </FieldLabel>
                  <Select name="role_id" defaultValue={data?.role?.id}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select role"
                        className={errors.role_id ? "border-destructive" : ""}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((item: Role) => (
                        <SelectItem key={item.id} value={item.id}>
                          <span className="capitalize">{item.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.role_id}</FieldError>
                </Field>

                {/* Master Input Field - Checkboxes */}
                <Field>
                  <FieldLabel>Indikator {StarRequired()}</FieldLabel>
                  <div
                    className={`border rounded-md p-4 max-h-80 overflow-y-auto space-y-3 ${
                      errors.master_input_ids ? "border-destructive" : ""
                    }`}
                  >
                    {inputs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No inputs available
                      </p>
                    ) : (
                      inputs.map((item: MasterInput) => (
                        <label
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                        >
                          <input
                            type="checkbox"
                            name="master_input_ids[]"
                            value={item.id}
                            defaultChecked={data?.existingInputIds?.includes(
                              item.id,
                            )}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" color="secondary">
                                {item.kode}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1 text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <FieldError>{errors.master_input_ids}</FieldError>
                </Field>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="ghost" asChild>
                <Link href={master.roleInputs().url} className="gap-2">
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

export default RoleInputForm;
