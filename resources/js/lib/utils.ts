import type { InertiaLinkProps } from "@inertiajs/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IS_CLIENT } from "./constants";

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
export const MONTHS = monthsList();
export type MonthOption = ReturnType<typeof monthsList>[number];

export const getMonthName = (monthValue: number): string => {
	const month = monthsList().find((m) => m.value === monthValue);
	return month ? month.label : "Unknown";
};

export const createUrlSearchParams = (): URLSearchParams => {
	return IS_CLIENT ? new URLSearchParams(window.location.search) : new URLSearchParams();
};

export const buildUrlWithQuery = (baseUrl: string, params: URLSearchParams): string => {
	const queryString = params.toString();
	return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
