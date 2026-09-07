import * as z from "zod";
import type { NewClinicRequest } from "#/api/gen/types";
import {
	optionalTaxId,
	password,
	requiredEmail,
	requiredText,
} from "#/shared/form/schema";
import { digitsOf } from "#/shared/format/document";

export const clinicSchema = z.object({
	name: requiredText("Informe o nome da clínica."),
	legalName: z.string(),
	taxId: optionalTaxId,
	segment: z.string(),
	managerName: requiredText("Informe o nome do gestor."),
	managerEmail: requiredEmail,
	managerPassword: password(),
});

export type ClinicDraft = z.infer<typeof clinicSchema>;

export const EMPTY_CLINIC_DRAFT: ClinicDraft = {
	name: "",
	legalName: "",
	taxId: "",
	segment: "",
	managerName: "",
	managerEmail: "",
	managerPassword: "",
};

export function newClinicRequestOf(draft: ClinicDraft): NewClinicRequest {
	return {
		name: draft.name.trim(),
		legalName: blankToUndefined(draft.legalName),
		taxId: blankToUndefined(digitsOf(draft.taxId)),
		segment: blankToUndefined(draft.segment),
		managerName: draft.managerName.trim(),
		managerEmail: draft.managerEmail.trim(),
		managerPassword: draft.managerPassword,
	};
}

function blankToUndefined(value: string) {
	return value.trim() === "" ? undefined : value.trim();
}
