import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import type { HTMLAttributes } from "react";
import { type Appearance, useAppearance } from "@/hooks/use-appearance";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

export default function AppearanceToggleTab({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
	const { appearance, updateAppearance } = useAppearance();

	const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
		{ value: "light", icon: Sun, label: "Light" },
		{ value: "dark", icon: Moon, label: "Dark" },
		{ value: "system", icon: Monitor, label: "System" },
	];

	return (
		<ButtonGroup {...props} >
			{tabs.map(({ value, icon: Icon, label }) => (
				<Button
					key={value}
					variant={appearance === value ? "default" : "outline"}
					onClick={() => updateAppearance(value)}
					className="flex items-center px-3.5 py-1.5"
				>
					<Icon className="-ml-1 h-4 w-4" />
					<span className="ml-1.5 text-sm">{label}</span>
				</Button>
			))}
		</ButtonGroup>
	)
}
