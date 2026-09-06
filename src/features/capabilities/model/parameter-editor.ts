export type ParameterEditor =
	| { kind: "number"; integer: boolean; min?: number; max?: number }
	| { kind: "flag" }
	| { kind: "choice"; options: string[] }
	| { kind: "multiChoice"; options: string[] }
	| { kind: "text" };

const RANGE = /between (-?[\d.]+) and (-?[\d.]+)/;
const MULTI_CHOICE = /^a comma separated selection of (.+)$/;
const SINGLE_CHOICE = /^one of (.+)$/;

/**
 * Variability mechanism C: the API describes each parameter's accepted values
 * in `accepts`, so the settings screen builds its controls from the payload
 * instead of hard-coding one control per parameter.
 */
export function editorFor(accepts: string | undefined): ParameterEditor {
	const description = (accepts ?? "").trim();

	if (description.startsWith("a whole number")) {
		return { kind: "number", integer: true, ...rangeIn(description) };
	}
	if (description.startsWith("a decimal number")) {
		return { kind: "number", integer: false, ...rangeIn(description) };
	}
	if (description === "true or false") {
		return { kind: "flag" };
	}

	const multiple = description.match(MULTI_CHOICE);
	if (multiple) {
		return { kind: "multiChoice", options: optionsIn(multiple[1]) };
	}

	const single = description.match(SINGLE_CHOICE);
	if (single) {
		return { kind: "choice", options: optionsIn(single[1]) };
	}

	return { kind: "text" };
}

export function selectedItems(value: string) {
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
	} catch {
		return value ? [value] : [];
	}
}

export function itemsAsValue(items: readonly string[]) {
	return JSON.stringify(items);
}

function rangeIn(description: string) {
	const matched = description.match(RANGE);
	if (!matched) {
		return {};
	}

	return { min: Number(matched[1]), max: Number(matched[2]) };
}

function optionsIn(list: string) {
	return list
		.split(",")
		.map((option) => option.trim())
		.filter(Boolean);
}
