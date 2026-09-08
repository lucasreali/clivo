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
		label: "Clínicas",
		to: "/console",
		icon: Buildings,
	},
	{
		label: "Nova clínica",
		to: "/console/nova-clinica",
		icon: Plus,
	},
	{
		label: "Administradores",
		to: "/console/administradores",
		icon: UserGear,
	},
];

export const CLINIC_NAVIGATION: readonly ConsoleNavigationItem[] = [
	{
		label: "Módulos",
		to: "/console/clinicas/$tenantId/modulos",
		icon: PuzzlePiece,
	},
	{
		label: "Parâmetros",
		to: "/console/clinicas/$tenantId/parametros",
		icon: SlidersHorizontal,
	},
];
