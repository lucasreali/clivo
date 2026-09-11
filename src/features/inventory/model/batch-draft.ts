import * as z from "zod";
import type { BatchRequest } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";
import { amountOf, positiveAmount } from "./amount";

const CODE_MAX = 40;

const MANUFACTURER_MAX = 80;

export const batchSchema = z.object({
	code: requiredText("Informe o código do lote.").max(
		CODE_MAX,
		`O código cabe em ${CODE_MAX} caracteres.`,
	),
	expiresOn: requiredText("Informe a data de validade."),
	quantity: positiveAmount,
	manufacturer: z
		.string()
		.max(
			MANUFACTURER_MAX,
			`O fabricante cabe em ${MANUFACTURER_MAX} caracteres.`,
		),
});

export type BatchDraft = z.infer<typeof batchSchema>;

export const EMPTY_BATCH: BatchDraft = {
	code: "",
	expiresOn: "",
	quantity: "",
	manufacturer: "",
};

export function batchRequestOf(draft: BatchDraft): BatchRequest {
	return {
		code: draft.code.trim(),
		expiresOn: draft.expiresOn,
		quantity: amountOf(draft.quantity) ?? 0,
		manufacturer: blankToUndefined(draft.manufacturer),
	};
}

function blankToUndefined(value: string) {
	return value.trim() === "" ? undefined : value.trim();
}
