import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandleSelectChangeProps } from "@/lib/utils";
import { SearchIcon, XIcon } from "lucide-react";
import { ChangeEvent, memo, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface TableTextSearchProps {
  params: {
    [k: string]: string;
  };
  handleSelectChange: (value: HandleSelectChangeProps) => void;
  text?: string;
}

const TableTextSearch = memo(
  ({ params, handleSelectChange, text = "" }: TableTextSearchProps) => {
    const search = params.search ?? "";
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebouncedCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        handleSelectChange({ search: e.target.value });
      },
      500,
    );

    const handleClear = () => {
      handleSelectChange({ search: "" });
    };

    return (
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="search"
          type="text"
          name="search"
          placeholder={`Search ${text}...`}
          defaultValue={search}
          className="pl-9 pr-9"
          onChange={debouncedSearch}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleClear}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors size-6 rounded-full"
          >
            <XIcon className="size-5" />
          </Button>
        )}
      </div>
    );
  },
);
TableTextSearch.displayName = "TableTextSearch";

export default TableTextSearch;
