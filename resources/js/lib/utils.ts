import type { InertiaLinkProps } from "@inertiajs/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isSameUrl(url1: NonNullable<InertiaLinkProps["href"]>, url2: NonNullable<InertiaLinkProps["href"]>) {
	return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps["href"]>): string {
	return typeof url === "string" ? url : url.url;
}

export interface HandleSelectChangeProps {
	per_page?: string;
	page?: string;
	search?: string;
}

export const yearsList = (startYear: number, endYear: number): number[] => {
	const years: number[] = [];
	for (let year = startYear; year <= endYear; year++) {
		years.push(year);
	}
	return years;
};

export const monthsList = (): { value: number; label: string }[] => {
	return [
		{ value: 1, label: "Januari" },
		{ value: 2, label: "Februari" },
		{ value: 3, label: "Maret" },
		{ value: 4, label: "April" },
		{ value: 5, label: "Mei" },
		{ value: 6, label: "Juni" },
		{ value: 7, label: "Juli" },
		{ value: 8, label: "Agustus" },
		{ value: 9, label: "September" },
		{ value: 10, label: "Oktober" },
		{ value: 11, label: "November" },
		{ value: 12, label: "Desember" },
	];
};
export type MonthOption = ReturnType<typeof monthsList>[number];

export const formatCurrency = (amount: number, locale = "id-ID", currency = "IDR"): string => {
	return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount).replace("IDR", "Rp.");
};

export const formatNumber = (value: number, decimals = 0): string => {
	return new Intl.NumberFormat("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
		value,
	);
};

/**
 * 
 * @param formula 
 * @param totalKinerja 
 * 
 * Example Formula
	LTE 30 = "TIDAK BAIK";
	LTE 45 = "KURANG";
	LTE 60 = "CUKUP";
	LTE 75 = "BAIK";
	GT 75 = "BAIK SEKALI";
 */
export const totalKinerjaToKinerja = (formula: string, totalKinerja: number): string => {
	if (!formula) return "-";

	const conditions = formula
		.split(";")
		.map((cond) => cond.trim())
		.filter((cond) => cond.length > 0);

	for (const condition of conditions) {
		const [operatorPart, valuePart] = condition.split("=").map((part) => part.trim());
		if (!operatorPart || !valuePart) continue;

		const operatorMatch = operatorPart.match(/^(LTE|GTE|LT|GT|EQ)\s+(.+)$/i);
		if (!operatorMatch) continue;

		const operator = operatorMatch[1].toUpperCase();
		const threshold = parseFloat(operatorMatch[2]);

		if (Number.isNaN(threshold)) continue;

		let conditionMet = false;
		console.log({ operator, threshold, totalKinerja });
		switch (operator) {
			case "LTE":
				conditionMet = totalKinerja <= threshold;
				break;
			case "GTE":
				conditionMet = totalKinerja >= threshold;
				break;
			case "LT":
				conditionMet = totalKinerja < threshold;
				break;
			case "GT":
				conditionMet = totalKinerja > threshold;
				break;
			case "EQ":
				conditionMet = totalKinerja === threshold;
				break;
		}

		if (conditionMet) {
			return valuePart.replace(/^"|"$/g, "");
		}
	}

	return "-";
};
