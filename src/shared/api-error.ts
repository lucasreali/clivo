import { ResponseError } from "#/api/gen/.kubb/client";
import type { ErrorResponse } from "#/api/gen/types";

const FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

const MALFORMED_PAYLOAD = 400;
const NOT_GRANTED = 403;
const NOT_CONTRACTED = 404;
const REJECTED_BY_RULE = 422;

export function messageOf(error: unknown) {
	if (isMalformedPayload(error)) {
		return FALLBACK;
	}

	const body = bodyOf(error);
	return body?.message ?? body?.error ?? FALLBACK;
}

export function violationsOf(error: unknown) {
	const violations = bodyOf(error)?.violations ?? [];
	return Object.fromEntries(
		violations.flatMap((violation) =>
			violation.field ? [[violation.field, violation.message ?? ""]] : [],
		),
	);
}

export function statusOf(error: unknown) {
	return error instanceof ResponseError ? error.status : undefined;
}

export function isMalformedPayload(error: unknown) {
	return statusOf(error) === MALFORMED_PAYLOAD;
}

export function isNotGranted(error: unknown) {
	return statusOf(error) === NOT_GRANTED;
}

export function isNotContracted(error: unknown) {
	return statusOf(error) === NOT_CONTRACTED;
}

export function isRejectedByRule(error: unknown) {
	return statusOf(error) === REJECTED_BY_RULE;
}

function bodyOf(error: unknown) {
	return error instanceof ResponseError
		? (error.data as ErrorResponse | undefined)
		: undefined;
}
