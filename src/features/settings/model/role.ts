import type { RoleChangeRequestRoleEnumKey } from "#/api/gen/types";

type RoleDescription = {
	role: RoleChangeRequestRoleEnumKey;
	label: string;
	hint: string;
};

const CLINIC_ROLES: readonly RoleDescription[] = [
	{
		role: "RECEPTION",
		label: "Front desk",
		hint: "Schedule, customer registration and check-in.",
	},
	{
		role: "PRACTITIONER",
		label: "Practitioner",
		hint: "Sees patients and fills in the encounter record.",
	},
	{
		role: "ASSISTANT",
		label: "Assistant",
		hint: "Supports the encounter without signing the record.",
	},
	{
		role: "MANAGER",
		label: "Management",
		hint: "Administers the clinic users, modules and parameters.",
	},
];

export class Roles {
	private constructor(private readonly items: readonly RoleDescription[]) {}

	static assignableByManager() {
		return new Roles(CLINIC_ROLES);
	}

	map<T>(project: (role: RoleDescription) => T) {
		return this.items.map(project);
	}
}

export function labelOfRole(role: string | undefined) {
	return (
		CLINIC_ROLES.find((item) => item.role === role)?.label ??
		labelOfPlatformRole(role)
	);
}

export function manages(role: string | undefined) {
	return role === "MANAGER";
}

function labelOfPlatformRole(role: string | undefined) {
	return role === "PLATFORM_ADMIN" ? "Platform" : (role ?? "Team");
}
