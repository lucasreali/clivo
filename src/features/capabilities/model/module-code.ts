export const MODULE = {
	dependents: "dependent",
	sessionPackages: "sessionpackage",
	inventory: "inventory",
	batches: "batch",
	insurance: "insurance",
	notifications: "notification",
	commissions: "commission",
	odontogram: "odontogram",
	bodyMap: "bodymap",
} as const;

export type ModuleCode = (typeof MODULE)[keyof typeof MODULE];
