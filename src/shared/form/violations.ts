import type { AnyFormApi } from "@tanstack/react-form";
import { violationsOf } from "#/shared/api-error";

/**
 * Moves the field violations the API reported onto the matching inputs, so a
 * rule only the server can check reads like any other validation message.
 */
export function showViolations(error: unknown, form: AnyFormApi) {
	const fields = Object.fromEntries(
		Object.entries(violationsOf(error)).map(([field, message]) => [
			field,
			{ message },
		]),
	);

	form.setErrorMap({ onServer: { fields } });
}
