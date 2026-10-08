import * as z from "zod";
import type {
	ClinicDetailsRequest,
	ClinicView,
	NewClinicRequest,
} from "#/api/gen/types";
import {
	optionalTaxId,
	password,
	requiredEmail,
	requiredText,
} from "#/shared/form/schema";
import { digitsOf, maskTaxId } from "#/shared/format/document";

/**
 * What identifies a clinic, shared by onboarding and by the later correction of
 * those details. The sizes mirror the API's `ClinicDetailsRequest`.
 */
const clinicDetailsShape = {
	name: requiredText("Informe o nome da clínica.").max(
		120,
		"O nome cabe em 120 caracteres.",
	),
	legalName: z.string().max(160, "A razão social cabe em 160 caracteres."),
	taxId: optionalTaxId,
	segment: z.string().max(60, "O segmento cabe em 60 caracteres."),
};

export const clinicDetailsSchema = z.object(clinicDetailsShape);

export type ClinicDetailsDraft = z.infer<typeof clinicDetailsSchema>;

export const clinicSchema = z.object({
	...clinicDetailsShape,
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
		...clinicDetailsRequestOf(draft),
		managerName: draft.managerName.trim(),
		managerEmail: draft.managerEmail.trim(),
		managerPassword: draft.managerPassword,
	};
}

export function clinicDetailsDraftOf(clinic?: ClinicView): ClinicDetailsDraft {
	return {
		name: clinic?.name ?? "",
		legalName: clinic?.legalName ?? "",
		taxId: maskTaxId(clinic?.taxId ?? ""),
		segment: clinic?.segment ?? "",
	};
}

export function clinicDetailsRequestOf(
	draft: ClinicDetailsDraft,
): ClinicDetailsRequest {
	return {
		name: draft.name.trim(),
		legalName: blankToUndefined(draft.legalName),
		taxId: blankToUndefined(digitsOf(draft.taxId)),
		segment: blankToUndefined(draft.segment),
	};
}

function blankToUndefined(value: string) {
	return value.trim() === "" ? undefined : value.trim();
}
