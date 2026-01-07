import { Form, Link, router } from "@inertiajs/react";
import { ArrowLeftIcon, KeyIcon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import ButtonLoading from "@/components/commons/button-loading";
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

const RoleInputForm = ({ roles, inputs, data }: RoleInputFormProps) => {
	const [searchQuery, setSearchQuery] = useState("");

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

	const goto = useCallback((value: string) => {
		router.visit(master.roleInputs.edit(value).url);
	}, []);

	const filteredInputs = useMemo(() => {
		if (!searchQuery.trim()) return inputs;

		const query = searchQuery.toLowerCase();
		return inputs.filter(
			(item: MasterInput) => item.description.toLowerCase().includes(query) || item.kode.toLowerCase().includes(query),
		);
	}, [inputs, searchQuery]);

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
									<FieldLabel htmlFor="role_id">Role {StarRequired()}</FieldLabel>
									<Select name="role_id" defaultValue={data?.role?.id} onValueChange={goto}>
										<SelectTrigger>
											<SelectValue placeholder="Select role" className={errors.role_id ? "border-destructive" : ""} />
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

									{/* Search Input */}
									<div className="relative mb-3">
										<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
										<input
											type="text"
											placeholder="Cari indikator..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
										{searchQuery && (
											<button
												type="button"
												onClick={() => setSearchQuery("")}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
											>
												<XIcon className="h-4 w-4" />
											</button>
										)}
									</div>

									<div
										className={`border rounded-md p-4 max-h-120 overflow-y-auto space-y-3 ${errors.master_input_ids ? "border-destructive" : ""
											}`}
									>
										{filteredInputs.length === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-4">
												{searchQuery ? "Tidak ada indikator yang cocok" : "No inputs available"}
											</p>
										) : (
											filteredInputs.map((item: MasterInput) => (
												<Item key={item.id} variant="outline">
													<ItemMedia>
														<Checkbox
															name="master_input_ids[]"
															value={item.id}
															defaultChecked={data?.existingInputIds?.includes(item.id)}
															className="mt-1"
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
												// <label
												// 	key={item.id}
												// 	className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
												// >
												// 	<div>
												// 		<input
												// 			type="checkbox"
												// 			name="master_input_ids[]"
												// 			value={item.id}
												// 			defaultChecked={data?.existingInputIds?.includes(item.id)}
												// 			className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
												// 		/>
												// 	</div>
												// 	<div className="flex-1 grid gap-2 min-w-0">
												// 		<div className="text-sm mt-1 text-muted-foreground">{item.description}</div>
												// 		<div className="flex items-center gap-2">
												// 			<Badge variant="outline" color="secondary">
												// 				{item.kode}
												// 			</Badge>
												// 		</div>
												// 	</div>
												// </label>
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
