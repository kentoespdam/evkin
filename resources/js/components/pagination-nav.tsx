import { usePaginationHandler } from "@/hooks/use-pagination";
import { Pagination, PaginationMeta, PaginationMetaLink } from "@/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  type LucideIcon,
} from "lucide-react";
import { memo } from "react";
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

type NavType = "first" | "prev" | "next" | "last";

interface PaginationHandlerResult {
  meta: PaginationMeta;
  handleSelectChange: (value: { per_page?: string; page?: string }) => void;
  items: PaginationMetaLink[];
  selected: PaginationMetaLink | undefined;
}

interface NavButtonProps {
  type: NavType;
  meta: PaginationMeta;
  handleSelectChange: PaginationHandlerResult["handleSelectChange"];
}

const iconMap: Record<NavType, LucideIcon> = {
  first: ChevronsLeftIcon,
  prev: ArrowLeftIcon,
  next: ArrowRightIcon,
  last: ChevronsRightIcon,
};

const NavButton = memo(({ type, meta, handleSelectChange }: NavButtonProps) => {
  const pageMap: Record<NavType, number | null> = {
    first: meta.current_page > 1 ? 1 : null,
    prev: meta.current_page > 1 ? meta.current_page - 1 : null,
    next: meta.current_page < meta.last_page ? meta.current_page + 1 : null,
    last: meta.current_page < meta.last_page ? meta.last_page : null,
  };

  const targetPage = pageMap[type];
  if (!targetPage) return null;

  const Icon = iconMap[type];

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleSelectChange({ page: targetPage.toString() })}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  );
});
NavButton.displayName = "NavButton";

interface TotalPageProps {
  meta: PaginationMeta;
}

const TotalPage = memo(({ meta }: TotalPageProps) => (
  <span className="text-sm font-medium text-muted-foreground">
    {meta.from} - {meta.to} of {meta.total}
  </span>
));
TotalPage.displayName = "TotalPage";

const pageSizeList = [1, 2, 10, 25, 50, 100];

interface PageSizeProps {
  meta: PaginationMeta;
  handleSelectChange: PaginationHandlerResult["handleSelectChange"];
}

const PageSize = memo(({ meta, handleSelectChange }: PageSizeProps) => (
  <span className="flex items-center gap-2">
    <span className="text-sm font-medium text-muted-foreground">Size:</span>
    <Select
      value={meta.per_page.toString()}
      onValueChange={(value) => handleSelectChange({ per_page: value })}
    >
      <SelectTrigger className="w-20">
        <SelectValue />
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
));
PageSize.displayName = "PageSize";

interface PageListProps {
  items: PaginationMetaLink[];
  selected: PaginationMetaLink | undefined;
  handleSelectChange: PaginationHandlerResult["handleSelectChange"];
}

const PageList = memo(
  ({ items, selected, handleSelectChange }: PageListProps) => (
    <div className="flex items-center gap-2">
      <Select
        value={selected?.page?.toString() ?? "1"}
        onValueChange={(value) => handleSelectChange({ page: value })}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.page?.toString() ?? "1"}>
              Page {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
);
PageList.displayName = "PageList";

const PaginationNav = ({ page }: PaginationNavProps) => {
  const { meta, handleSelectChange, items, selected } =
    usePaginationHandler(page);

  return (
    <div className="flex justify-end px-4 items-center gap-2">
      <PageSize meta={meta} handleSelectChange={handleSelectChange} />
      <TotalPage meta={meta} />
      <NavButton
        type="first"
        meta={meta}
        handleSelectChange={handleSelectChange}
      />
      <NavButton
        type="prev"
        meta={meta}
        handleSelectChange={handleSelectChange}
      />
      <PageList
        items={items}
        selected={selected}
        handleSelectChange={handleSelectChange}
      />
      <NavButton
        type="next"
        meta={meta}
        handleSelectChange={handleSelectChange}
      />
      <NavButton
        type="last"
        meta={meta}
        handleSelectChange={handleSelectChange}
      />
    </div>
  );
};

export default PaginationNav;
