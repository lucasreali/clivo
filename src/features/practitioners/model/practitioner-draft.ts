import * as z from "zod";
import type { PractitionerRequest, PractitionerView } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";

const NAME_MAX = 120;

const LICENSE_MAX = 30;

export const practitionerSchema = z.object({
	name: requiredText("Informe o nome do profissional.").max(
		NAME_MAX,
		`O nome cabe em ${NAME_MAX} caracteres.`,
	),
	licenseNumber: z
		.string()
		.trim()
		.max(LICENSE_MAX, `O registro cabe em ${LICENSE_MAX} caracteres.`),
});

export type PractitionerDraft = z.infer<typeof practitionerSchema>;

export function practitionerDraftOf(
	practitioner?: PractitionerView,
): PractitionerDraft {
	return {
		name: practitioner?.name ?? "",
		licenseNumber: practitioner?.licenseNumber ?? "",
	};
}

/** A blank registry is sent as absent, so the API stores no license at all. */
export function practitionerRequestOf(
	draft: PractitionerDraft,
): PractitionerRequest {
	const license = draft.licenseNumber.trim();

	return {
		name: draft.name.trim(),
		licenseNumber: license === "" ? undefined : license,
	};
}
