import {
	Buildings,
	type Icon,
	Plus,
	PuzzlePiece,
	SlidersHorizontal,
	UserGear,
} from "@phosphor-icons/react";

export type ConsoleNavigationItem = {
	label: string;
	to: string;
	icon: Icon;
};

export const CONSOLE_NAVIGATION: readonly ConsoleNavigationItem[] = [
	{
		label: "Clinics",
		to: "/console",
		icon: Buildings,
	},
	{
		label: "New clinic",
		to: "/console/new-clinic",
		icon: Plus,
	},
	{
		label: "Administrators",
		to: "/console/administrators",
		icon: UserGear,
	},
];

export const CLINIC_NAVIGATION: readonly ConsoleNavigationItem[] = [
	{
		label: "Modules",
		to: "/console/clinics/$tenantId/modules",
		icon: PuzzlePiece,
	},
	{
		label: "Parameters",
		to: "/console/clinics/$tenantId/parameters",
		icon: SlidersHorizontal,
	},
];
