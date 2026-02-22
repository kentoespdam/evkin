import { Form } from "@inertiajs/react";
import { useRef } from "react";
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

export interface DeleteDialogProps {
	formAction: string;
	showDeleteDialog: boolean;
	setShowDeleteDialog: (show: boolean) => void;
}
const DeleteDialog = ({ formAction, showDeleteDialog, setShowDeleteDialog }: DeleteDialogProps) => {
	const confirmationInput = useRef<HTMLInputElement>(null);

	return (
		<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
			<DialogContent>
				<DialogTitle>Apakah Anda yakin ingin menghapus peran ini?</DialogTitle>
				<DialogDescription>
					Setelah peran ini dihapus, semua sumber daya dan data terkait juga akan dihapus secara permanen. Silakan ketik <code>DELETE</code> untuk mengonfirmasi penghapusan permanen peran ini.
				</DialogDescription>

				<Form
					action={formAction}
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
								<Label htmlFor="confirmation">Ketik DELETE untuk konfirmasi</Label>

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
									<Button variant="secondary" onClick={() => resetAndClearErrors()}>
										Batal
									</Button>
								</DialogClose>

								<Button type="submit" variant="destructive" disabled={processing}>
									Hapus Peran
								</Button>
							</DialogFooter>
						</>
					)}
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteDialog;
