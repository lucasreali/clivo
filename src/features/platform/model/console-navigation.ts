export type ConsoleNavigationItem = {
	label: string;
	to: string;
	icon: string;
};

export const CONSOLE_NAVIGATION: readonly ConsoleNavigationItem[] = [
	{
		label: "Clínicas",
		to: "/console",
		icon: "M2.4 13.6h11.2M3.8 13.6V5.2L8 2.6l4.2 2.6v8.4M6.4 13.6v-3.4h3.2v3.4M6.4 7.2h3.2",
	},
	{
		label: "Nova clínica",
		to: "/console/nova-clinica",
		icon: "M8 3.2v9.6M3.2 8h9.6",
	},
	{
		label: "Administradores",
		to: "/console/administradores",
		icon: "M8 7.6a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8zM3 13.4c0-2.4 2.2-3.6 5-3.6s5 1.2 5 3.6",
	},
];

export const CLINIC_NAVIGATION: readonly ConsoleNavigationItem[] = [
	{
		label: "Módulos",
		to: "/console/clinicas/$tenantId/modulos",
		icon: "M2.4 2.8h4.6v4.6H2.4zM9 2.8h4.6v4.6H9zM2.4 8.6h4.6v4.6H2.4zM9 8.6h4.6v4.6H9z",
	},
	{
		label: "Parâmetros",
		to: "/console/clinicas/$tenantId/parametros",
		icon: "M8 10.4a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8zM8 1.6v1.8M8 12.6v1.8M1.6 8h1.8M12.6 8h1.8M3.5 3.5l1.3 1.3M11.2 11.2l1.3 1.3M12.5 3.5l-1.3 1.3M4.8 11.2l-1.3 1.3",
	},
];
