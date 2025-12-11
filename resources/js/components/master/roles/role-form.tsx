import ButtonLoading from "@/components/commons/button-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import master from "@/routes/master";
import { Role } from "@/types/role";
import { Form, Link } from "@inertiajs/react";
import { ArrowLeftIcon, NetworkIcon } from "lucide-react";
import { memo, useMemo } from "react";

interface RoleFormProps {
  role?: Role;
}
const RoleForm = memo(({ role }: RoleFormProps) => {
  const formAction = useMemo(() => {
    if (role?.id) {
      return master.roles.update.form(role.id);
    }
    return master.roles.store.form();
  }, [role]);

  return (
    <Form {...formAction} resetOnSuccess>
      {({ errors, processing, wasSuccessful }) => (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Role Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <NetworkIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Role Information
                  </h3>
                </div>

                {/* Name Field */}
                <Field>
                  <FieldLabel htmlFor="name">
                    Role Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={role?.name}
                    placeholder="Enter role name"
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
                <Link href={master.roles().url} className="gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <ButtonLoading processing={processing} />
            </div>

            {/* Success Message */}
            {wasSuccessful && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  ✓ Role {role?.id ? "updated" : "created"} successfully!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Form>
  );
});

RoleForm.displayName = "RoleForm";

export default RoleForm;
