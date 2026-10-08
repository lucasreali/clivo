import type { Modules } from "#/features/capabilities/model/capabilities";
import {
	MODULE,
	type ModuleCode,
} from "#/features/capabilities/model/module-code";
import type { Option } from "#/shared/ui/options";

/**
 * The field types the API's Abstract Factory registers (`patterns/factory`):
 * each code here is the bean name of a `FieldFactory`. A new type is a new
 * factory there and one entry here — the sheet control already renders any
 * of them from the payload.
 */
type FieldKind = "text" | "number" | "date" | "choice" | "component";

type FieldTypeDescription = {
	code: string;
	label: string;
	kind: FieldKind;
};

const FIELD_TYPES: readonly FieldTypeDescription[] = [
	{ code: "SHORT_TEXT", label: "Texto curto", kind: "text" },
	{ code: "LONG_TEXT", label: "Texto longo", kind: "text" },
	{ code: "INTEGER", label: "Número inteiro", kind: "number" },
	{ code: "DECIMAL", label: "Número decimal", kind: "number" },
	{ code: "SCALE", label: "Escala", kind: "number" },
	{ code: "DATE", label: "Data", kind: "date" },
	{ code: "SINGLE_CHOICE", label: "Escolha única", kind: "choice" },
	{ code: "COMPONENT", label: "Componente especial", kind: "component" },
];

export const FIELD_TYPE_OPTIONS: readonly Option[] = FIELD_TYPES.map(
	(type) => ({ value: type.code, label: type.label }),
);

export const FIELD_TYPE_CODES = FIELD_TYPES.map((type) => type.code);

export function kindOf(fieldType: string): FieldKind | undefined {
	return FIELD_TYPES.find((type) => type.code === fieldType)?.kind;
}

export function labelOfFieldType(fieldType: string | undefined) {
	return (
		FIELD_TYPES.find((type) => type.code === fieldType)?.label ??
		fieldType ??
		"—"
	);
}

/**
 * The special components the API's `ComponentFactory` beans build. Each one
 * belongs to a module, so the editor only offers what the clinic contracted —
 * variability mechanism A inside mechanism B.
 */
type ComponentDescription = {
	code: string;
	label: string;
	module: ModuleCode;
	/** A body map draws the regions the template lists; a dental chart has its own. */
	declaresRegions: boolean;
};

const COMPONENTS: readonly ComponentDescription[] = [
	{
		code: "ODONTOGRAM",
		label: "Odontograma",
		module: MODULE.odontogram,
		declaresRegions: false,
	},
	{
		code: "BODY_MAP",
		label: "Mapa corporal",
		module: MODULE.bodyMap,
		declaresRegions: true,
	},
];

/**
 * A component the template already uses stays listed even after its module was
 * switched off, so opening the template never blanks a field; the API refuses to
 * publish it until the module is back.
 */
export function componentOptionsFor(
	modules: Modules,
	inUse: readonly string[] = [],
): Option[] {
	return COMPONENTS.filter(
		(component) =>
			modules.reaches(component.module) || inUse.includes(component.code),
	).map((component) => ({
		value: component.code,
		label: modules.reaches(component.module)
			? component.label
			: `${component.label} (módulo inativo)`,
	}));
}

export function componentOf(code: string | undefined) {
	return COMPONENTS.find((component) => component.code === code);
}

/** The dentitions the API's chart catalogue declares for the odontogram. */
export const DENTITION_OPTIONS: readonly Option[] = [
	{ value: "permanent", label: "Permanente" },
	{ value: "deciduous", label: "Decídua (de leite)" },
];
