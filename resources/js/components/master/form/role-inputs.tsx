import { Form, Link, router } from "@inertiajs/react";
import { ArrowLeftIcon, KeyIcon, SearchIcon, XIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ButtonLoading from "@/components/commons/button-loading";
import StarRequired from "@/components/commons/star-required";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import master from "@/routes/master";
import type { MasterInput } from "@/types/master-input";
import type { Role } from "@/types/role";

interface RoleInputFormProps {
	roles: Role[];
	inputs: MasterInput[];
	data?: {
		id: string;
		role: Role;
		existingInputIds?: string[];
	};
}

const SearchInput = memo(
	({
		searchQuery,
		handleSearchChange,
	}: {
		searchQuery: string;
		handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	}) => {
		const inputRef = useRef<HTMLInputElement>(null);

		const handleClear = useCallback(() => {
			handleSearchChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
			inputRef.current?.focus();
		}, [handleSearchChange]);

		return (
			<div className="relative mb-3">
				<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<input
					ref={inputRef}
					type="text"
					placeholder="Cari indikator..."
					value={searchQuery}
					onChange={handleSearchChange}
					className="w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => handleClear()}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Clear search"
					>
						<XIcon className="h-4 w-4" />
					</button>
				)}
			</div>
		);
	},
);
SearchInput.displayName = "SearchInput";

const InputItem = memo(
	({ item, checked, onChange }: { item: MasterInput; checked: boolean; onChange: (id: string) => void }) => {
		const handleChange = useCallback(() => {
			onChange(item.id);
		}, [item.id, onChange]);

		return (
			<Item key={item.id} variant="outline">
				<ItemMedia>
					<Checkbox
						name="master_input_ids[]"
						id={`input-${item.id}`}
						value={item.id}
						className="mt-1"
						checked={checked}
						onCheckedChange={handleChange}
					/>
				</ItemMedia>
				<ItemContent>
					<ItemTitle>{item.description}</ItemTitle>
					<ItemDescription>
						<Badge variant="outline" color="secondary">
							{item.kode}
						</Badge>
					</ItemDescription>
				</ItemContent>
			</Item>
		);
	},
);
InputItem.displayName = "InputItem";

const RoleInputForm = ({ roles, inputs, data }: RoleInputFormProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

	const debouncedSetSearchQuery = useDebouncedCallback(
		(value: string) => {
			setDebouncedSearchQuery(value);
		},
		300,
		{ maxWait: 1000 },
	);

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setSearchQuery(value);
			debouncedSetSearchQuery(value);
		},
		[debouncedSetSearchQuery],
	);

	// Gunakan debouncedSearchQuery untuk filteredInputs
	const filteredInputs = useMemo(() => {
		if (!debouncedSearchQuery.trim()) return inputs;

		const query = debouncedSearchQuery.toLowerCase();
		return inputs.filter(
			(item) => item.description.toLowerCase().includes(query) || item.kode.toLowerCase().includes(query),
		);
	}, [inputs, debouncedSearchQuery]);

	const formAction = useMemo(() => {
		const form = data?.id ? master.roleInputs.update(data.id) : master.roleInputs.store();

		return {
			action: form.url,
			method: form.method,
		};
	}, [data?.id]);

	const goto = useCallback((value: string) => {
		router.visit(master.roleInputs.edit(value).url);
	}, []);

	const initialCheckedItems = useMemo(() => data?.existingInputIds || [], [data?.existingInputIds]);

	const [checkedItems, setCheckedItems] = useState<string[]>(initialCheckedItems);

	useEffect(() => {
		setCheckedItems(initialCheckedItems);
	}, [initialCheckedItems]);

	const isAllChecked = useMemo(
		() => checkedItems.length > 0 && checkedItems.length === filteredInputs.length,
		[checkedItems, filteredInputs],
	);

	const handleItemChange = useCallback((id: string) => {
		setCheckedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
	}, []);

	const handleToggleAll = useCallback(() => {
		if (isAllChecked) {
			setCheckedItems([]);
		} else {
			setCheckedItems(filteredInputs.map((item) => item.id));
		}
	}, [isAllChecked, filteredInputs]);

	const renderCheckboxList = useMemo(() => {
		if (filteredInputs.length === 0) {
			return (
				<p className="text-sm text-muted-foreground text-center py-4">
					{searchQuery ? "Tidak ada indikator yang cocok" : "No inputs available"}
				</p>
			);
		}

		return filteredInputs.map((item) => (
			<InputItem key={item.id} item={item} checked={checkedItems.includes(item.id)} onChange={handleItemChange} />
		));
	}, [filteredInputs, searchQuery, checkedItems, handleItemChange]);

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
										Informasi Role & Input
									</h3>
								</div>

								{/* Role Field */}
								<Field>
									<FieldLabel htmlFor="role_id">
										Peran <StarRequired />
									</FieldLabel>
									<Select name="role_id" defaultValue={data?.role?.id} onValueChange={goto}>
										<SelectTrigger>
											<SelectValue placeholder="Pilih peran" className={errors.role_id ? "border-destructive" : ""} />
										</SelectTrigger>
										<SelectContent>
											{roles.map((item) => (
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
									<FieldLabel>
										Indikator <StarRequired />
									</FieldLabel>

									<SearchInput searchQuery={searchQuery} handleSearchChange={handleSearchChange} />

									<Button
										type="button"
										size="sm"
										variant={isAllChecked ? "destructive" : "default"}
										onClick={handleToggleAll}
										className="mb-3"
									>
										{isAllChecked ? "Hilangkan Semua Centang" : "Centang Semua"}
									</Button>

									<div
										className={`border rounded-md p-4 max-h-120 overflow-y-auto space-y-3 ${errors.master_input_ids ? "border-destructive" : ""
											}`}
									>
										{renderCheckboxList}
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
									Batal
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

export default memo(RoleInputForm);
