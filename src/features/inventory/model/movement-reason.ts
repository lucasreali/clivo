import { requiredText } from "#/shared/form/schema";

/**
 * Mirrors the API's `MovementReason`. The contract marks the field optional,
 * but the value object refuses a blank one and caps it at 160 characters, so
 * every screen that records a movement states the rule the server enforces.
 */
export const REASON_MAX_LENGTH = 160;

export function requiredReason(message: string) {
	return requiredText(message).max(
		REASON_MAX_LENGTH,
		`O motivo cabe em ${REASON_MAX_LENGTH} caracteres.`,
	);
}
