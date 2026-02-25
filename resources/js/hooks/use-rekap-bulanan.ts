import { router } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import { PRESERVE_SCROLL, PRESERVE_STATE, REPLACE } from "@/lib/constants";
import { buildUrlWithQuery, createUrlSearchParams } from "@/lib/utils";
import rekap from "@/routes/rekap";
import type { Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { MasterInput } from "@/types/master-input";
import type { RekapInputTahunan } from "@/types/rekap-tahunan";
import type { TransaksiInput } from "@/types/transaksi-inputs";

export const useRekapBulananFilters = () => {
	const baseUrl = rekap.rekapBulanan().url;

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

export const useRekapBulananData = (
	page: Pagination<MasterInput>,
	rekapData: TransaksiInput[],
	aspects: Aspect[],
	rekapTahunan: RekapInputTahunan[],
) => {
	return useMemo(() => {
		const aspectDataMap = new Map<string, Aspect[]>();
		for (const aspect of aspects) {
			const reportTypeId = aspect.reportType.id;
			const aspectList = aspectDataMap.get(reportTypeId) || [];
			aspectList.push(aspect);
			aspectDataMap.set(reportTypeId, aspectList);
		}

		const pageDataMap = new Map<string, MasterInput[]>();
		for (const input of page.data) {
			const aspectId = input.aspect?.id;
			if (aspectId) {
				const inputs = pageDataMap.get(aspectId) || [];
				inputs.push(input);
				pageDataMap.set(aspectId, inputs);
			}
		}

		const rekapDataMap = new Map<string, number>();
		for (const item of rekapData) {
			const masterInputId = item.masterInput?.id;
			const year = item.year;
			const month = item.month;
			if (masterInputId && year && month) {
				const mapKey = `${masterInputId}-${year}-${month}`;
				console.log("key", mapKey, "value", item.nilai);
				rekapDataMap.set(mapKey, item.nilai);
			}
		}

		const rekapTahunanMap = new Map<string, number>();
		for (const item of rekapTahunan) {
			const masterInputId = item.masterInput?.id;
			if (masterInputId) {
				rekapTahunanMap.set(masterInputId, item.nilai);
			}
		}
		return {
			aspectDataMap,
			pageDataMap,
			rekapDataMap,
			rekapTahunanMap,
		};
	}, [page.data, rekapData, aspects, rekapTahunan]);
};
