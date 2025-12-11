import InputError from "@/components/commons/input-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@inertiajs/react";
import { useRef } from "react";

export interface RoleDeleteDialogProps {
  roleId: string;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
}
const DeleteRoleDialog = ({
  roleId,
  showDeleteDialog,
  setShowDeleteDialog,
}: RoleDeleteDialogProps) => {
  const confirmationInput = useRef<HTMLInputElement>(null);
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogTitle>Are you sure you want to delete this role?</DialogTitle>
        <DialogDescription>
          Once this role is deleted, all of its resources and data will also be
          permanently deleted. Please enter <code>DELETE</code> to confirm you
          would like to permanently delete this role.
        </DialogDescription>

        <Form
          action={`/master/roles/${roleId}`}
          method="delete"
          options={{
            preserveScroll: true,
          }}
          onError={() => confirmationInput.current?.focus()}
          resetOnSuccess
          className="space-y-6"
          onSuccess={() => setShowDeleteDialog(false)}
        >
          {({ resetAndClearErrors, processing, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="confirmation">Type DELETE to confirm</Label>

                <Input
                  id="confirmation"
                  type="text"
                  name="confirmation"
                  ref={confirmationInput}
                  placeholder="DELETE"
                  autoComplete="off"
                />

                <InputError message={errors.confirmation} />
              </div>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button
                    variant="secondary"
                    onClick={() => resetAndClearErrors()}
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  type="submit"
                  variant="destructive"
                  disabled={processing}
                >
                  Delete Role
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoleDialog;
