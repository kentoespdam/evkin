import { HandleSelectChangeProps } from "@/lib/utils";
import { Pagination } from "@/types";
import { router } from "@inertiajs/react";
import { useCallback, useMemo, useState } from "react";

export const usePaginationHandler = (page: Pagination<unknown>) => {
  const [userId, setUserId]=useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog]=useState<boolean>(false);
  const params=useMemo(()=>{
    const searchParams=new URLSearchParams(window.location.search);
    return Object.fromEntries(searchParams.entries());
  },[])

  const { items, selected } = useMemo(() => {
    const items = page.meta.links.filter(
      (link) =>
        link.url !== null &&
        !link.label.includes("Previous") &&
        !link.label.includes("Next"),
    );
    const selected = page.meta.links.find((link) => link.active);
    return { items, selected };
  }, [page.meta.links]);

  const getPageNumber = useCallback((pageNum: number | null) => {
    return pageNum?.toString() ?? null;
  }, []);

  const handleSelectChange = useCallback(
    (value: HandleSelectChangeProps) => {
      const searchParams = new URLSearchParams(params);

      if (value.per_page) {
        searchParams.delete("page");
        searchParams.set("per_page", value.per_page);
      }

      if (value.page) {
        searchParams.set("page", value.page);
      }

      if (value.search !== undefined) {
        value.search
          ? searchParams.set("search", value.search)
          : searchParams.delete("search");
        searchParams.delete("page");
      }

      router.visit(`${page.meta.path}?${searchParams.toString()}`);
    },
    [page.meta.path],
  );

  return {
    meta: page.meta,
    links: page.links,
    handleSelectChange,
    getPageNumber,
    items,
    selected,
    params,
    userId,
    setUserId,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
