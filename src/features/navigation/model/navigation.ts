import type { ModuleCode } from "#/features/capabilities/model/module-code";
import { MODULE } from "#/features/capabilities/model/module-code";

export type NavigationItem = {
	label: string;
	to: string;
	icon: string;
	requires?: ModuleCode;
};

export const NAVIGATION: readonly NavigationItem[] = [
	{
		label: "Painel do dia",
		to: "/",
		icon: "M2.5 2.5h4.2v4.2H2.5zM9.3 2.5h4.2v4.2H9.3zM2.5 9.3h4.2v4.2H2.5zM9.3 9.3h4.2v4.2H9.3z",
	},
	{
		label: "Agenda",
		to: "/agenda",
		icon: "M2.5 4h11v9.5h-11zM2.5 7h11M5.5 2v3M10.5 2v3",
	},
	{
		label: "Clientes",
		to: "/clientes",
		icon: "M8 8a2.6 2.6 0 100-5.2A2.6 2.6 0 008 8zM2.8 13.6c0-2.6 2.4-3.9 5.2-3.9s5.2 1.3 5.2 3.9",
	},
	{
		label: "Financeiro",
		to: "/financeiro",
		icon: "M2.2 4.6h11.6v7H2.2zM2.2 7.4h11.6M5 10h2.2",
	},
	{
		label: "Pacotes",
		to: "/pacotes",
		icon: "M2.4 5.1L8 2.3l5.6 2.8v5.8L8 13.7l-5.6-2.8zM2.4 5.1L8 7.9l5.6-2.8M8 7.9v5.8",
		requires: MODULE.sessionPackages,
	},
	{
		label: "Convênios",
		to: "/convenios",
		icon: "M2.2 4.6h11.6v7H2.2zM5 8.2h6M2.2 6.4h11.6",
		requires: MODULE.insurance,
	},
	{
		label: "Estoque",
		to: "/estoque",
		icon: "M2.4 5.1L8 2.3l5.6 2.8v5.8L8 13.7l-5.6-2.8zM2.4 5.1L8 7.9l5.6-2.8M8 7.9v5.8",
		requires: MODULE.inventory,
	},
	{
		label: "Comissões",
		to: "/comissoes",
		icon: "M3 13L13 3M3 4.6a1.6 1.6 0 103.2 0 1.6 1.6 0 00-3.2 0zM9.8 11.4a1.6 1.6 0 103.2 0 1.6 1.6 0 00-3.2 0z",
		requires: MODULE.commissions,
	},
	{
		label: "Configurações",
		to: "/configuracoes",
		icon: "M8 10.4a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8zM8 1.6v1.8M8 12.6v1.8M1.6 8h1.8M12.6 8h1.8M3.5 3.5l1.3 1.3M11.2 11.2l1.3 1.3M12.5 3.5l-1.3 1.3M4.8 11.2l-1.3 1.3",
	},
];
