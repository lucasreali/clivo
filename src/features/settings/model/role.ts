import type { RoleChangeRequestRoleEnumKey } from "#/api/gen/types";

type RoleDescription = {
	role: RoleChangeRequestRoleEnumKey;
	label: string;
	hint: string;
};

const CLINIC_ROLES: readonly RoleDescription[] = [
	{
		role: "RECEPTION",
		label: "Recepção",
		hint: "Agenda, cadastro de clientes e chegada.",
	},
	{
		role: "PRACTITIONER",
		label: "Profissional",
		hint: "Atende e preenche a ficha do atendimento.",
	},
	{
		role: "ASSISTANT",
		label: "Auxiliar",
		hint: "Apoia o atendimento sem assinar a ficha.",
	},
	{
		role: "MANAGER",
		label: "Gestão",
		hint: "Administra usuários, módulos e parâmetros da clínica.",
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
	return role === "PLATFORM_ADMIN" ? "Plataforma" : (role ?? "Equipe");
}
