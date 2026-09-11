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
		label: "Day panel",
		to: "/",
		icon: SquaresFour,
	},
	{
		label: "Schedule",
		to: "/schedule",
		icon: CalendarBlank,
	},
	{
		label: "Customers",
		to: "/customers",
		icon: Users,
	},
	{
		label: "Encounters",
		to: "/encounters",
		icon: ClipboardText,
		pending: true,
	},
	{
		label: "Billing",
		to: "/billing",
		icon: CurrencyCircleDollar,
	},
	{
		label: "Inventory",
		to: "/inventory",
		icon: Package,
		requires: MODULE.inventory,
		pending: true,
	},
	{
		label: "Reports",
		to: "/reports",
		icon: ChartBar,
		pending: true,
	},
	{
		label: "Packages",
		to: "/packages",
		icon: Stack,
		requires: MODULE.sessionPackages,
		pending: true,
	},
	{
		label: "Insurance",
		to: "/insurance",
		icon: IdentificationCard,
		requires: MODULE.insurance,
		pending: true,
	},
	{
		label: "Commissions",
		to: "/commissions",
		icon: Percent,
		requires: MODULE.commissions,
		pending: true,
	},
	{
		label: "Settings",
		to: "/settings",
		icon: Gear,
	},
];
