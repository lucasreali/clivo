import type { NewClinicRequest } from "#/api/gen/types";

export type ClinicDraft = {
	name: string;
	code: string;
	legalName: string;
	taxId: string;
	segment: string;
	managerName: string;
	managerEmail: string;
	managerPassword: string;
};

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

export function isReadyToOpen(draft: ClinicDraft) {
	return [
		draft.name,
		draft.code,
		draft.managerName,
		draft.managerEmail,
		draft.managerPassword,
	].every((value) => value.trim() !== "");
}

function digitsOf(value: string) {
	return value.replace(/\D/g, "");
}

function blankToUndefined(value: string) {
	return value.trim() === "" ? undefined : value.trim();
}
