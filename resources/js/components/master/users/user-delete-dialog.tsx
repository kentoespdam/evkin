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

interface DeleteUserDialogProps {
  userId: string;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
}
const DeleteUserDialog = ({
  userId,
  showDeleteDialog,
  setShowDeleteDialog,
}: DeleteUserDialogProps) => {
  const passwordInput = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
        <DialogDescription>
          Once your account is deleted, all of its resources and data will also
          be permanently deleted. Please enter <code>DELETE</code> to confirm
          you would like to permanently delete your account.
        </DialogDescription>

        <Form
          action={`/master/users/${userId}`}
          method="delete"
          options={{
            preserveScroll: true,
          }}
          onError={() => passwordInput.current?.focus()}
          resetOnSuccess
          className="space-y-6"
          onSuccess={() => setShowDeleteDialog(false)}
        >
          {({ resetAndClearErrors, processing, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="password">Type DELETE to confirm</Label>

                <Input
                  id="password"
                  type="text"
                  name="password"
                  ref={passwordInput}
                  placeholder="DELETE"
                  autoComplete="off"
                />

                <InputError message={errors.password} />
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
                  Delete account
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
