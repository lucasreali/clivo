import * as z from "zod";
import type { UserRegistrationRequest } from "#/api/gen/types";
import { password, requiredEmail, requiredText } from "#/shared/form/schema";

const CLINIC_ROLES = [
	"RECEPTION",
	"PRACTITIONER",
	"ASSISTANT",
	"MANAGER",
] as const;

/**
 * Mirrors the API's `UserRegistrationRequest`. Only the four clinic roles are
 * accepted: a platform administrator is created from the console, never by a
 * clinic manager.
 */
export const userSchema = z.object({
	name: requiredText("Informe o nome."),
	email: requiredEmail,
	password: password(),
	role: z.enum(CLINIC_ROLES, { message: "Escolha o perfil." }),
});

export type UserDraft = z.infer<typeof userSchema>;

export const EMPTY_USER: UserDraft = {
	name: "",
	email: "",
	password: "",
	role: "RECEPTION",
};

export function userRequestOf(draft: UserDraft): UserRegistrationRequest {
	return {
		name: draft.name.trim(),
		email: draft.email.trim(),
		password: draft.password,
		role: draft.role,
	};
}
