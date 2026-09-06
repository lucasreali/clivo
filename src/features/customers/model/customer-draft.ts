import type { CustomerRequest, CustomerView } from "#/api/gen/types";

export type CustomerDraft = {
	name: string;
	phone: string;
	nationalId: string;
	birthDate: string;
	email: string;
	postalCode: string;
	street: string;
};

export const EMPTY_DRAFT: CustomerDraft = {
	name: "",
	phone: "",
	nationalId: "",
	birthDate: "",
	email: "",
	postalCode: "",
	street: "",
};

export function draftOf(customer: CustomerView | undefined): CustomerDraft {
	return {
		name: customer?.name ?? "",
		phone: customer?.phone ?? "",
		nationalId: customer?.nationalId ?? "",
		birthDate: customer?.birthDate ?? "",
		email: customer?.email ?? "",
		postalCode: customer?.postalCode ?? "",
		street: customer?.street ?? "",
	};
}

export function requestOf(draft: CustomerDraft): CustomerRequest {
	return {
		name: draft.name,
		phone: draft.phone,
		nationalId: blankToUndefined(draft.nationalId),
		birthDate: blankToUndefined(draft.birthDate),
		email: blankToUndefined(draft.email),
		postalCode: blankToUndefined(draft.postalCode),
		street: blankToUndefined(draft.street),
	};
}

function blankToUndefined(value: string) {
	return value.trim() === "" ? undefined : value.trim();
}
