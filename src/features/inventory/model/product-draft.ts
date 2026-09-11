import * as z from "zod";
import type { ProductRequest } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";
import { amountOf, nonNegativeAmount } from "./amount";

const NAME_MAX = 120;

const UNIT_MAX = 10;

export const productSchema = z.object({
	name: requiredText("Informe o nome do produto.").max(
		NAME_MAX,
		`O nome cabe em ${NAME_MAX} caracteres.`,
	),
	unit: requiredText("Informe a unidade de medida.").max(
		UNIT_MAX,
		`A unidade cabe em ${UNIT_MAX} caracteres (ml, un, cx).`,
	),
	minStock: nonNegativeAmount,
	batchControlled: z.boolean(),
});

export type ProductDraft = z.infer<typeof productSchema>;

export const EMPTY_PRODUCT: ProductDraft = {
	name: "",
	unit: "",
	minStock: "",
	batchControlled: false,
};

export function productRequestOf(draft: ProductDraft): ProductRequest {
	return {
		name: draft.name.trim(),
		unit: draft.unit.trim(),
		minStock: amountOf(draft.minStock) ?? 0,
		batchControlled: draft.batchControlled,
	};
}
