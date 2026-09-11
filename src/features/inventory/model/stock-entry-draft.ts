import * as z from "zod";
import type { StockEntryRequest } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";
import { amountOf, positiveAmount } from "./amount";
import { requiredReason } from "./movement-reason";

export const stockEntrySchema = z.object({
	type: requiredText("Escolha o tipo de movimento."),
	quantity: positiveAmount,
	reason: requiredReason("Descreva o motivo do movimento."),
});

export type StockEntryDraft = z.infer<typeof stockEntrySchema>;

export function emptyStockEntry(type: string): StockEntryDraft {
	return { type, quantity: "", reason: "" };
}

export function stockEntryRequestOf(draft: StockEntryDraft): StockEntryRequest {
	return {
		type: draft.type,
		quantity: amountOf(draft.quantity) ?? 0,
		reason: draft.reason.trim(),
	};
}
