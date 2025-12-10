import { Pagination } from "@/types";
import { router } from "@inertiajs/react";
import { useCallback, useMemo } from "react";

interface HandleSelectChangeProps {
  per_page?: string;
  page?: string;
  search?: string;
}

export const usePaginationHandler = (
  page: Pagination<unknown>,
  params: Record<string, string | string[]> | null,
) => {
  const { items, selected } = useMemo(() => {
    const items = page.links.filter((link) => {
      const label = link.label
        .replaceAll("&laquo; ", "")
        .replaceAll(" &raquo;", "");
      return (
        link.url !== null &&
        !label.startsWith("Next") &&
        !label.startsWith("Previous")
      );
    });
    const selected = page.links.find((link) => link.active);
    return { items, selected };
  }, [page, params]);

  const getPageNumber = useCallback((url: string | null) => {
    if (!url || url === "#") return null;
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.searchParams.get("page");
    } catch (e) {
      return null;
    }
  }, []);

  const handleSelectChange = useCallback(
    (value: HandleSelectChangeProps) => {
      const searchParams = new URLSearchParams(window.location.search);
      console.log(searchParams.toString());
      // Initialize with existing params if valid
      if (params) {
        Object.entries(params).forEach(([key, paramValue]) => {
          if (paramValue) {
            searchParams.set(key, paramValue.toString());
          }
        });
      }

      if (value.per_page) {
        if (searchParams.has("page")) {
          searchParams.delete("page");
        }
        searchParams.set("per_page", value.per_page);
      }

      if (value.page) {
        searchParams.set("page", value.page);
      }

      if (value.search !== undefined) {
        if (value.search) {
          searchParams.set("search", value.search);
        } else {
          searchParams.delete("search");
        }
        // Reset page when searching
        if (searchParams.has("page")) {
          searchParams.delete("page");
        }
      }

      router.visit(`${page.path}?${searchParams.toString()}`);
    },
    [params, page],
  );

  return {
    handleSelectChange,
    getPageNumber,
    items,
    selected,
  };
};
