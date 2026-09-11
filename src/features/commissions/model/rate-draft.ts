import * as z from "zod";
import type { RateRequest } from "#/api/gen/types";

/**
 * Mirrors the API's `CommissionRate`: a percentage of what was billed, never
 * negative and never above the whole amount.
 */
const TYPED = /^\d{1,3}(?:[.,]\d{1,2})?$/;

const CEILING = 100;

export const rateSchema = z.object({
	percentage: z
		.string()
		.trim()
		.min(1, "Informe o percentual.")
		.refine((value) => TYPED.test(value) && percentageOf(value) <= CEILING, {
			message: "Informe de 0 a 100, com até duas casas decimais.",
		}),
});

export type RateDraft = z.infer<typeof rateSchema>;

export function percentageOf(value: string) {
	return Number(value.trim().replace(",", "."));
}

export function rateDraftOf(percentage: number | undefined): RateDraft {
	return { percentage: percentage === undefined ? "" : String(percentage) };
}

export function rateRequestOf(draft: RateDraft): RateRequest {
	return { percentage: percentageOf(draft.percentage) };
}
