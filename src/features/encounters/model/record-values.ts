import type { RecordSheet, RecordValue, SheetField } from "#/api/gen/types";

export type RecordValues = Record<string, RecordValue>;

export function valuesOf(sheet: RecordSheet | undefined): RecordValues {
	return Object.fromEntries(
		fieldsOf(sheet)
			.filter((field) => field.value !== undefined)
			.map((field) => [field.code, field.value as RecordValue]),
	);
}

export function fieldsOf(sheet: RecordSheet | undefined): SheetField[] {
	return (sheet?.sections ?? []).flatMap((section) => section.fields ?? []);
}

export function missingRequired(
	sheet: RecordSheet | undefined,
	values: RecordValues,
) {
	return fieldsOf(sheet)
		.filter((field) => field.required && isBlank(values[field.code ?? ""]))
		.map((field) => field.label ?? field.code ?? "");
}

/**
 * The API refuses a blank answer on a typed field, so an emptied control has to
 * leave the payload instead of travelling as "".
 */
export function answered(values: RecordValues): RecordValues {
	return Object.fromEntries(
		Object.entries(values).filter(([, value]) => !isBlank(value)),
	);
}

function isBlank(value: RecordValue | undefined) {
	if (value === undefined || value === null || value === "") {
		return true;
	}
	return Array.isArray(value) && value.length === 0;
}
