import { SearchIcon, XIcon } from "lucide-react";
import { type ChangeEvent, memo, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, type HandleSelectChangeProps } from "@/lib/utils";

export interface TableTextSearchProps {
	params: {
		[k: string]: string;
	};
	handleSelectChange: (value: HandleSelectChangeProps) => void;
	text?: string;
	className?: string;
}

const TableTextSearch = memo(({ params, handleSelectChange, text, className }: TableTextSearchProps) => {
	const search = params.search ?? "";
	const inputRef = useRef<HTMLInputElement>(null);

	const debouncedSearch = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
		handleSelectChange({ search: e.target.value });
	}, 500);

	const handleClear = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
		handleSelectChange({ search: "" });
	}, [handleSelectChange]);

	return (
		<div className={cn("relative w-full sm:max-w-xs", className)}>
			<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				ref={inputRef}
				type="text"
				name="search"
				placeholder={text ? `Search ${text}...` : "Search..."}
				defaultValue={search}
				className="pl-9 pr-9"
				onChange={debouncedSearch}
				aria-label={text ? `Search ${text}` : "Search"}
			/>
			{search && (
				<Button
					variant="ghost"
					size="icon"
					type="button"
					onClick={handleClear}
					className="absolute right-3 top-1/2 size-6 -translate-y-1/2 rounded-full"
					aria-label="Clear search"
				>
					<XIcon className="size-4" />
				</Button>
			)}
		</div>
	);
});
TableTextSearch.displayName = "TableTextSearch";

export default TableTextSearch;
