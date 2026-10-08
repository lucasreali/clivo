import * as z from "zod";
import type { PlanRequest, PlanView } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";

const NAME_MAX = 120;

/**
 * Mirrors the API's `CoveragePercentage`: the share of the bill the plan pays,
 * from nothing to all of it, with at most two decimal places.
 */
const TYPED = /^\d{1,3}(?:[.,]\d{1,2})?$/;

const CEILING = 100;

function percentageOf(value: string) {
	return Number(value.trim().replace(",", "."));
}

export const planSchema = z.object({
	name: requiredText("Informe o nome da operadora.").max(
		NAME_MAX,
		`O nome cabe em ${NAME_MAX} caracteres.`,
	),
	reimbursementPercentage: z
		.string()
		.trim()
		.min(1, "Informe o percentual de reembolso.")
		.refine((value) => TYPED.test(value) && percentageOf(value) <= CEILING, {
			message: "Informe de 0 a 100, com até duas casas decimais.",
		}),
});

export type PlanDraft = z.infer<typeof planSchema>;

export function planDraftOf(plan?: PlanView): PlanDraft {
	return {
		name: plan?.name ?? "",
		reimbursementPercentage:
			plan?.reimbursementPercentage === undefined
				? ""
				: String(plan.reimbursementPercentage),
	};
}

export function planRequestOf(draft: PlanDraft): PlanRequest {
	return {
		name: draft.name.trim(),
		reimbursementPercentage: percentageOf(draft.reimbursementPercentage),
	};
}

export function percentageLabel(value: number | undefined) {
	return value === undefined ? "—" : `${String(value).replace(".", ",")}%`;
}
