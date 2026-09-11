import {
	CalendarBlank,
	ChartBar,
	ClipboardText,
	CurrencyCircleDollar,
	Gear,
	type Icon,
	IdentificationCard,
	Package,
	Percent,
	SquaresFour,
	Stack,
	Users,
} from "@phosphor-icons/react";
import type { ModuleCode } from "#/features/capabilities/model/module-code";
import { MODULE } from "#/features/capabilities/model/module-code";

export type NavigationItem = {
	label: string;
	to: string;
	icon: Icon;
	requires?: ModuleCode;
	pending?: true;
};

export const NAVIGATION: readonly NavigationItem[] = [
	{
		label: "Painel do dia",
		to: "/",
		icon: SquaresFour,
	},
	{
		label: "Agenda",
		to: "/agenda",
		icon: CalendarBlank,
	},
	{
		label: "Clientes",
		to: "/clientes",
		icon: Users,
	},
	{
		label: "Atendimentos",
		to: "/atendimentos",
		icon: ClipboardText,
		pending: true,
	},
	{
		label: "Financeiro",
		to: "/financeiro",
		icon: CurrencyCircleDollar,
	},
	{
		label: "Estoque",
		to: "/estoque",
		icon: Package,
		requires: MODULE.inventory,
	},
	{
		label: "Relatórios",
		to: "/relatorios",
		icon: ChartBar,
		pending: true,
	},
	{
		label: "Pacotes",
		to: "/pacotes",
		icon: Stack,
		requires: MODULE.sessionPackages,
		pending: true,
	},
	{
		label: "Convênios",
		to: "/convenios",
		icon: IdentificationCard,
		requires: MODULE.insurance,
		pending: true,
	},
	{
		label: "Comissões",
		to: "/comissoes",
		icon: Percent,
		requires: MODULE.commissions,
		pending: true,
	},
	{
		label: "Configurações",
		to: "/configuracoes",
		icon: Gear,
	},
];
