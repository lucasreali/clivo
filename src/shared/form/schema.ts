import * as z from "zod";
import {
	isNationalId,
	isPhone,
	isPostalCode,
	isTaxId,
} from "#/shared/validation/document";

const EMAIL = z.email();

export function isEmail(value: string) {
	return EMAIL.safeParse(value).success;
}

export function requiredText(message: string) {
	return z.string().trim().min(1, message);
}

/**
 * An optional field is only judged once it has something in it: leaving a CPF
 * blank is allowed, filling it with nine digits is not.
 */
export function optional(accepts: (value: string) => boolean, message: string) {
	return z.string().refine((value) => value.trim() === "" || accepts(value), {
		message,
	});
}

export const NATIONAL_ID_MESSAGE = "Invalid CPF. Check the 11 digits.";
export const TAX_ID_MESSAGE = "Invalid CNPJ. Check the 14 digits.";
export const PHONE_MESSAGE =
	"Invalid phone number. Enter the area code and 8 or 9 digits.";
export const POSTAL_CODE_MESSAGE = "Invalid postal code. It has 8 digits.";
export const EMAIL_MESSAGE = "Invalid email address.";

export const optionalNationalId = optional(isNationalId, NATIONAL_ID_MESSAGE);
export const optionalTaxId = optional(isTaxId, TAX_ID_MESSAGE);
export const optionalPostalCode = optional(isPostalCode, POSTAL_CODE_MESSAGE);
export const optionalPhone = optional(isPhone, PHONE_MESSAGE);
export const optionalEmail = optional(isEmail, EMAIL_MESSAGE);

export const requiredPhone = z
	.string()
	.min(1, "Enter the phone number.")
	.refine(isPhone, { message: PHONE_MESSAGE });

export const requiredEmail = z
	.string()
	.min(1, "Enter the email address.")
	.refine(isEmail, { message: EMAIL_MESSAGE });

export function password(
	message = "The password needs at least 8 characters.",
) {
	return z.string().min(8, message);
}
