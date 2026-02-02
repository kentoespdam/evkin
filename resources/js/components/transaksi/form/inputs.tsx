import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { formatNumber } from "@/lib/utils";
import type { RoleInput } from "@/types/role-inputs";
import type { TransaksiInput } from "@/types/transaksi-inputs";

interface TransaksiInputsFormProps {
	isForm: boolean;
	row: RoleInput & { data?: TransaksiInput };
}
const TransaksiInputsForm = ({ isForm, row }: TransaksiInputsFormProps) => {
	if (!isForm) {
		return (
			<div className="flex gap-2">
				{row.masterInput.satuan !== "" && <Badge variant={"outline"}>{row.masterInput.satuan}</Badge>}
				<span>{formatNumber(row.data?.nilai ?? 0, 2)}</span>
			</div>
		);
	}

	return (
		<div className="flex gap-1 w-full">
			<Input name="master_input_ids[]" type="hidden" defaultValue={row.masterInput.id} />
			<InputGroup>
				<InputGroupInput name="nilais[]" type="number" defaultValue={row.data?.nilai ?? 0} step={0.01} />
				<InputGroupAddon>
					<InputGroupText>{row.masterInput.satuan}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
};

export default TransaksiInputsForm;
