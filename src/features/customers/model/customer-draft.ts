import * as z from "zod";
import type { CustomerRequest, CustomerView } from "#/api/gen/types";
import {
	optionalEmail,
	optionalNationalId,
	optionalPostalCode,
	requiredPhone,
	requiredText,
} from "#/shared/form/schema";
import {
	digitsOf,
	maskNationalId,
	maskPhone,
	maskPostalCode,
} from "#/shared/format/document";

export const customerSchema = z.object({
	name: requiredText("Informe o nome completo."),
	phone: requiredPhone,
	nationalId: optionalNationalId,
	birthDate: z.string(),
	email: optionalEmail,
	postalCode: optionalPostalCode,
	street: z.string(),
});

export type CustomerDraft = z.infer<typeof customerSchema>;

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
		phone: maskPhone(customer?.phone ?? ""),
		nationalId: maskNationalId(customer?.nationalId ?? ""),
		birthDate: customer?.birthDate ?? "",
		email: customer?.email ?? "",
		postalCode: maskPostalCode(customer?.postalCode ?? ""),
		street: customer?.street ?? "",
	};
}

export function requestOf(draft: CustomerDraft): CustomerRequest {
	return {
		name: draft.name.trim(),
		phone: digitsOf(draft.phone),
		nationalId: blankToUndefined(digitsOf(draft.nationalId)),
		birthDate: blankToUndefined(draft.birthDate),
		email: blankToUndefined(draft.email),
		postalCode: blankToUndefined(digitsOf(draft.postalCode)),
		street: blankToUndefined(draft.street),
	};
}

function blankToUndefined(value: string) {
	return value.trim() === "" ? undefined : value.trim();
}
