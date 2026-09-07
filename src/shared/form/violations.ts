import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { violationsOf } from "#/shared/api-error";

/**
 * Moves the field violations the API reported onto the matching inputs, so a
 * rule only the server can check reads like any other validation message.
 */
export function showViolations<TValues extends FieldValues>(
	error: unknown,
	setError: UseFormSetError<TValues>,
) {
	for (const [field, message] of Object.entries(violationsOf(error))) {
		setError(field as Path<TValues>, { type: "server", message });
	}
}
