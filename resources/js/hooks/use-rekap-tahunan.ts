import { router } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import { PRESERVE_SCROLL, PRESERVE_STATE, REPLACE } from "@/lib/constants";
import { buildUrlWithQuery, createUrlSearchParams, yearsList } from "@/lib/utils";
import rekap from "@/routes/rekap";
import type { Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { RekapInputTahunan } from "@/types/rekap-tahunan";

// Filter Hook
export const useRekapTahunanFilters = () => {
	const baseUrl = useMemo(() => rekap.rekapTahunan().url, []);

	const updateAndVisit = useCallback(
		(key: string, value: string) => {
			const params = createUrlSearchParams();

			if (!value.trim()) {
				params.delete(key);
			} else {
				params.delete("page");
				params.set(key, value);
			}

			const nextUrl = buildUrlWithQuery(baseUrl, params);

			router.visit(nextUrl, {
				...PRESERVE_SCROLL,
				...PRESERVE_STATE,
				...REPLACE,
			});
		},
		[baseUrl],
	);

	const resetAll = useCallback(() => {
		router.visit(baseUrl, {
			...PRESERVE_SCROLL,
			preserveState: false,
			...REPLACE,
		});
	}, [baseUrl]);

	return { updateAndVisit, resetAll };
};

// Year Range Hook
export const useYearRangeLaporanTahunan = (fromYear: number, toYear: number) => {
	return useMemo(() => {
		if (fromYear > toYear) {
			console.warn(`Invalid year range: fromYear (${fromYear}) > toYear (${toYear})`);
			return yearsList(toYear, fromYear);
		}
		return yearsList(fromYear, toYear);
	}, [fromYear, toYear]);
};

// Data Processing Hook
export const useRekapTahunanData = (
	page: Pagination<MasterInput>,
	rekapData: RekapInputTahunan[],
	aspects: Aspect[],
) => {
	return useMemo(() => {
		// Early return for empty data
		if (!page.data?.length || !aspects?.length) {
			return {
				aspectDataMap: new Map(),
				pageDataMap: new Map(),
				rekapDataMap: new Map(),
				masterInputById: new Map(),
				aspectById: new Map(),
			};
		}

		// Process rekap data
		const rekapDataMap = new Map<string, number>();
		for (const item of rekapData) {
			if (item.masterInput?.id && item.year) {
				rekapDataMap.set(`${item.masterInput.id}-${item.year}`, item.nilai);
			}
		}

		// Process aspects by report type
		const aspectDataMap = new Map<string, Aspect[]>();
		for (const aspect of aspects) {
			const reportTypeId = aspect.reportType.id;
			const aspectList = aspectDataMap.get(reportTypeId) || [];
			aspectList.push(aspect);
			aspectDataMap.set(reportTypeId, aspectList);
		}

		// Process page data by aspect
		const pageDataMap = new Map<string, MasterInput[]>();
		for (const input of page.data) {
			const aspectId = input.aspect?.id;
			if (aspectId) {
				const inputs = pageDataMap.get(aspectId) || [];
				inputs.push(input);
				pageDataMap.set(aspectId, inputs);
			}
		}

		// Create lookup maps for quick access
		const masterInputById = new Map<string, MasterInput>();
		for (const input of page.data) {
			if (input.id) {
				masterInputById.set(input.id, input);
			}
		}

		const aspectById = new Map<string, Aspect>();
		for (const aspect of aspects) {
			aspectById.set(aspect.id, aspect);
		}

		return {
			aspectDataMap,
			pageDataMap,
			rekapDataMap,
			masterInputById,
			aspectById,
		};
	}, [page.data, rekapData, aspects]);
};

// Helper hook for URL initialization
export const useInitializeFilters = (filters: { fromYear: number; toYear: number }) => {
	const rangeLabel = useMemo(() => `${filters.fromYear} - ${filters.toYear}`, [filters.fromYear, filters.toYear]);

	return { rangeLabel };
};
