import * as z from "zod";
import type { SupplyRequest } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";

/**
 * Mirrors the API's `Quantity`: never negative, at most two decimal places.
 * The control holds a string, so the rule judges the string and `amountOf` is
 * the single place that turns one into a number.
 */
const TYPED = /^\d+(?:[.,]\d{1,2})?$/;

const CEILING = 99_999_999.99;

export function amountOf(value: string) {
	const typed = value.trim().replace(",", ".");
	return typed === "" ? undefined : Number(typed);
}

export const supplySchema = z.object({
	productId: requiredText("Escolha o produto."),
	quantity: z
		.string()
		.trim()
		.min(1, "Informe a quantidade.")
		.refine(
			(value) => {
				const amount = amountOf(value);
				return (
					TYPED.test(value.trim()) &&
					amount !== undefined &&
					amount > 0 &&
					amount <= CEILING
				);
			},
			{ message: "Informe uma quantidade maior que zero, com até duas casas." },
		),
});

export type SupplyDraft = z.infer<typeof supplySchema>;

export const EMPTY_SUPPLY: SupplyDraft = { productId: "", quantity: "" };

export function supplyRequestOf(draft: SupplyDraft): SupplyRequest {
	return {
		productId: draft.productId,
		quantity: amountOf(draft.quantity) ?? 0,
	};
}
