import type { RecordSheet, SheetField } from "#/api/gen/types";

export type RecordValues = Record<string, unknown>;

export function valuesOf(sheet: RecordSheet | undefined): RecordValues {
	return Object.fromEntries(
		fieldsOf(sheet).map((field) => [field.code, field.value]),
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

function isBlank(value: unknown) {
	if (value === undefined || value === null || value === "") {
		return true;
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return false;
}
