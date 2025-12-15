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
import { Role } from "@/types/role";
import { UserWithRole } from "@/types/user";
import { Form, Link } from "@inertiajs/react";
import {
  ArrowLeftIcon,
  SaveIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Method } from "@inertiajs/core";
import master from "@/routes/master";
import { Spinner } from "../../ui/spinner";
import ButtonLoading from "@/components/commons/button-loading";

interface UserFormProps {
  roles: Role[];
  user?: UserWithRole;
}
const UserForm = ({ roles, user }: UserFormProps) => {
  const [showPassword, setShowPassword] = useState(!user ? true : false);

  const formAction = useMemo(() => {
    if (user?.id) {
      const form = master.users.update(user.id);
      return {
        action: form.url,
        method: form.method,
      };
    }
    const form = master.users.store();
    return {
      action: form.url,
      method: form.method,
    };
  }, [user]);

  const changePasswordText = useMemo(
    () => (user ? "Change Password" : "Set Password"),
    [user],
  );

  return (
    <Form {...formAction} resetOnSuccess>
      {({ errors, processing, wasSuccessful }) => (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Personal Information
                  </h3>
                </div>

                {/* Name Field */}
                <Field>
                  <FieldLabel htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={user?.name}
                    placeholder="Enter full name"
                    className={errors.name ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>

                {/* Email Field */}
                <Field>
                  <FieldLabel htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user?.email}
                    placeholder="Enter email address"
                    className={errors.email ? "border-destructive" : ""}
                    required
                  />
                  <FieldError>{errors.email}</FieldError>
                </Field>
              </div>

              {/* Role & Permissions Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Role & Permissions
                  </h3>
                </div>

                {/* Role Select */}
                <Field>
                  <FieldLabel htmlFor="role_id">
                    User Role <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select name="role_id" defaultValue={user?.role.id}>
                    <SelectTrigger
                      id="role_id"
                      className={errors.role_id ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <span className="capitalize">{role.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.role_id}</FieldError>
                </Field>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {changePasswordText}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs"
                  >
                    {showPassword ? "Hide" : "Show"} Password Fields
                  </Button>
                </div>

                {showPassword && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      {user ? "Leave blank to keep current password" : ""} Must
                      be at least 8 characters.
                    </p>

                    {/* New Password Field */}
                    <Field>
                      <FieldLabel htmlFor="password">New Password</FieldLabel>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        className={errors.password ? "border-destructive" : ""}
                        autoComplete="new-password"
                      />
                      <FieldError>{errors.password}</FieldError>
                    </Field>

                    {/* Confirm Password Field */}
                    <Field>
                      <FieldLabel htmlFor="password_confirmation">
                        Confirm Password
                      </FieldLabel>
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <FieldError>{errors.password_confirmation}</FieldError>
                    </Field>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button type="button" variant="ghost" asChild>
                  <Link href={master.users().url} className="gap-2">
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
                    ✓ User updated successfully!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Form>
  );
};

export default UserForm;
