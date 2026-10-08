import * as z from "zod";
import type { AlertRequest } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";

/** Mirrors the API's `AlertNote`: required, at most 400 characters. */
export const ALERT_MAX = 400;

export const alertSchema = z.object({
	note: requiredText("Descreva o alerta.").max(
		ALERT_MAX,
		`O alerta cabe em ${ALERT_MAX} caracteres.`,
	),
});

export type AlertDraft = z.infer<typeof alertSchema>;

export function alertDraftOf(note?: string): AlertDraft {
	return { note: note ?? "" };
}

export function alertRequestOf(draft: AlertDraft): AlertRequest {
	return { note: draft.note.trim() };
}
