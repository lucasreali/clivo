import { ResponseError } from "#/api/gen/.kubb/client";
import type { ErrorResponse } from "#/api/gen/types";

const FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

export function messageOf(error: unknown) {
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

function bodyOf(error: unknown) {
	return error instanceof ResponseError
		? (error.data as ErrorResponse | undefined)
		: undefined;
}
