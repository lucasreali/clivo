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

export const NATIONAL_ID_MESSAGE = "CPF inválido. Confira os 11 dígitos.";
export const TAX_ID_MESSAGE = "CNPJ inválido. Confira os 14 dígitos.";
export const PHONE_MESSAGE = "Telefone inválido. Informe DDD e 8 ou 9 dígitos.";
export const POSTAL_CODE_MESSAGE = "CEP inválido. São 8 dígitos.";
export const EMAIL_MESSAGE = "E-mail inválido.";

export const optionalNationalId = optional(isNationalId, NATIONAL_ID_MESSAGE);
export const optionalTaxId = optional(isTaxId, TAX_ID_MESSAGE);
export const optionalPostalCode = optional(isPostalCode, POSTAL_CODE_MESSAGE);
export const optionalPhone = optional(isPhone, PHONE_MESSAGE);
export const optionalEmail = optional(isEmail, EMAIL_MESSAGE);

export const requiredPhone = z
	.string()
	.min(1, "Informe o telefone.")
	.refine(isPhone, { message: PHONE_MESSAGE });

export const requiredEmail = z
	.string()
	.min(1, "Informe o e-mail.")
	.refine(isEmail, { message: EMAIL_MESSAGE });

export function password(
	message = "A senha precisa de ao menos 8 caracteres.",
) {
	return z.string().min(8, message);
}
