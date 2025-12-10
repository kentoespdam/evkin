import { usePaginationHandler } from "@/hooks/use-pagination";
import { Pagination } from "@/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PaginationNavProps {
  page: Pagination<unknown>;
}

interface NavButtonProps extends PaginationNavProps {
  type: "first" | "prev" | "next" | "last";
}

const iconMap = {
  first: ChevronsLeftIcon,
  prev: ArrowLeftIcon,
  next: ArrowRightIcon,
  last: ChevronsRightIcon,
};

const NavButton = memo(({ page, type }: NavButtonProps) => {
  const { handleSelectChange, getPageNumber } = usePaginationHandler(page);
  const linkMap = {
    first: page.first_page_url,
    prev: page.prev_page_url,
    next: page.next_page_url,
    last: page.last_page_url,
  };

  // Hide first/prev when on first page, hide next/last when on last page
  if (type === "first" && page.current_page <= 1) return null;
  if (type === "last" && page.current_page >= page.last_page) return null;

  const link = linkMap[type];
  const Icon = iconMap[type];

  const onChange = (url: string) => {
    const pageNum = getPageNumber(url);
    if (pageNum) {
      handleSelectChange({ page: pageNum });
    }
  };
  return link ? (
    <ButtonGroup>
      <Button variant="outline" size="icon" onClick={() => onChange(link)}>
        <Icon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  ) : null;
});
NavButton.displayName = "NavButton";

const TotalPage = memo(({ page }: { page: Pagination<unknown> }) => {
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {page.from} - {page.to} of {page.total}
    </span>
  );
});
TotalPage.displayName = "TotalPage";

const pageSizeList = [2, 10, 25, 50, 100];
const PageSize = memo(({ page, params }: PaginationNavProps) => {
  const { handleSelectChange } = usePaginationHandler(page, params);
  const onChange = (value: string) => {
    handleSelectChange({ per_page: value });
  };
  return (
    <span className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Size:
      </span>
      <Select
        defaultValue={page.per_page.toString()}
        onValueChange={onChange}
        value={page.per_page.toString()}
      >
        <SelectTrigger>
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {pageSizeList.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  );
});
PageSize.displayName = "PageSize";

const PageList = memo(({ page, params }: PaginationNavProps) => {
  const { items, selected, handleSelectChange, getPageNumber } =
    usePaginationHandler(page, params);

  const onChange = (url: string) => {
    const pageNum = getPageNumber(url);
    if (pageNum) {
      handleSelectChange({ page: pageNum });
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Select
        value={selected?.url ?? "#"}
        defaultValue={selected?.url ?? "#"}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a page" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.url ?? "#"}>
              Page {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
PageList.displayName = "PageList";

const PaginationNav = ({ page, params }: PaginationNavProps) => {
  return (
    <div className="flex justify-end px-4 items-center gap-2">
      <PageSize page={page} params={params} />
      <TotalPage page={page} />
      <NavButton page={page} type="first" params={params} />
      <NavButton page={page} type="prev" params={params} />
      <PageList page={page} params={params} />
      <NavButton page={page} type="next" params={params} />
      <NavButton page={page} type="last" params={params} />
    </div>
  );
};

export default PaginationNav;
