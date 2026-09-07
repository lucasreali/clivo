import * as z from "zod";
import type { NewClinicRequest } from "#/api/gen/types";
import {
	optionalTaxId,
	password,
	requiredEmail,
	requiredText,
} from "#/shared/form/schema";
import { digitsOf } from "#/shared/format/document";

const CODE = /^[A-Za-z0-9]+$/;

export const clinicSchema = z.object({
	name: requiredText("Informe o nome da clínica."),
	code: requiredText("Informe o código.")
		.min(4, "O código tem de 4 a 12 caracteres.")
		.max(12, "O código tem de 4 a 12 caracteres.")
		.regex(CODE, "Use apenas letras e números, sem acento nem espaço."),
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
	code: "",
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
		code: draft.code.trim().toUpperCase(),
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
