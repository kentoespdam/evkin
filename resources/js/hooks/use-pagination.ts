import { router } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import type { HandleSelectChangeProps } from "@/lib/utils";
import type { Pagination } from "@/types";

export const usePaginationHandler = (page: Pagination<unknown>) => {
	const params = useMemo(() => {
		if (typeof window === "undefined") {
			return {} as Record<string, string>;
		}
		const searchParams = new URLSearchParams(window.location.search);
		return Object.fromEntries(searchParams.entries());
	}, []);

	const { items, selected } = useMemo(() => {
		const items = page.meta.links.filter((link) => {
			const label = (link.label ?? "").toString();
			return link.url !== null && !/previous|next/i.test(label);
		});
		const selected = page.meta.links.find((link) => link.active);
		return { items, selected };
	}, [page.meta.links]);

	const getPageNumber = useCallback((pageNum: number | null) => {
		return pageNum != null ? String(pageNum) : null;
	}, []);

	const handleSelectChange = useCallback(
		(value: HandleSelectChangeProps) => {
			const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

			if (value.per_page) {
				searchParams.delete("page");
				searchParams.set("per_page", value.per_page);
			}

			if (value.page) {
				searchParams.set("page", value.page);
			}

			if (value.search !== undefined) {
				if (value.search !== "") {
					searchParams.set("search", value.search);
				} else {
					searchParams.delete("search");
				}
				searchParams.delete("page");
			}

			router.get(page.meta.path, Object.fromEntries(searchParams.entries()), {
				preserveScroll: true,
				replace: true,
			});
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
	};
};
