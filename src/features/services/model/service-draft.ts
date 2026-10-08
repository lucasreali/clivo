import * as z from "zod";
import type { ServiceRequest, ServiceView } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";

const NAME_MAX = 120;

/** Mirrors the API's `ServiceDuration`. */
export const SHORTEST_MINUTES = 5;
export const LONGEST_MINUTES = 480;

/** The price column is NUMERIC(10,2); past this the database overflows into a 500. */
const PRICE_CEILING = 99_999_999.99;

/**
 * The controls hold strings, so the rules judge what was typed: "1e3" or "0x10"
 * would pass `Number()` and are refused here instead.
 */
const WHOLE = /^\d+$/;
const PRICE = /^\d+(?:[.,]\d{1,2})?$/;

function numberOf(value: string) {
	return Number(value.trim().replace(",", "."));
}

export const serviceSchema = z.object({
	name: requiredText("Informe o nome do serviço.").max(
		NAME_MAX,
		`O nome cabe em ${NAME_MAX} caracteres.`,
	),
	durationMinutes: z
		.string()
		.trim()
		.min(1, "Informe a duração.")
		.refine(
			(value) =>
				WHOLE.test(value) &&
				numberOf(value) >= SHORTEST_MINUTES &&
				numberOf(value) <= LONGEST_MINUTES,
			{
				message: `Informe de ${SHORTEST_MINUTES} a ${LONGEST_MINUTES} minutos, sem frações.`,
			},
		),
	price: z
		.string()
		.trim()
		.min(1, "Informe o preço.")
		.refine((value) => PRICE.test(value) && numberOf(value) <= PRICE_CEILING, {
			message: "Informe um valor em reais com até duas casas decimais.",
		}),
});

export type ServiceDraft = z.infer<typeof serviceSchema>;

export function serviceDraftOf(service?: ServiceView): ServiceDraft {
	return {
		name: service?.name ?? "",
		durationMinutes:
			service?.durationMinutes === undefined
				? ""
				: String(service.durationMinutes),
		price: service?.price === undefined ? "" : String(service.price),
	};
}

export function serviceRequestOf(draft: ServiceDraft): ServiceRequest {
	return {
		name: draft.name.trim(),
		durationMinutes: numberOf(draft.durationMinutes),
		price: numberOf(draft.price),
	};
}
