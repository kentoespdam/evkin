import { memo } from "react";
import type { Aspect } from "@/types/aspect";
import SectionHeaderRekapBuilder from "./section-header";

interface AspectRowBuilderProps {
	aspect: Aspect;
	colspan: number;
}
const AspectRowBuilder = memo(({ aspect, colspan }: AspectRowBuilderProps) => (
	<SectionHeaderRekapBuilder title={aspect.name} colSpan={colspan} bgColor="bg-amber-50" textColor="text-amber-800" />
));

AspectRowBuilder.displayName = "AspectRowBuilder";

export default AspectRowBuilder;
