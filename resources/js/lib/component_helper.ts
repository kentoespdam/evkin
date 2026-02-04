import { cn } from "./utils";

export const BORDER_CLASS = "border";
export const TEXT_CENTER_CLASS = "text-center";
export const YELLOW_ODD_CLASS = "bg-yellow-100";
export const PX_42 = "px-42";

export const getMonthCellClassName = (monthValue: number) =>
	cn(TEXT_CENTER_CLASS, BORDER_CLASS, monthValue % 2 === 1 ? YELLOW_ODD_CLASS : "");
