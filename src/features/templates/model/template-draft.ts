import * as z from "zod";
import type {
	FieldRequest,
	FieldView,
	RecordTemplateRequest,
	RecordTemplateView,
} from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";
import { componentOf, FIELD_TYPE_CODES, kindOf } from "./field-types";

/** The sizes mirror the API's `RecordTemplateRequest`. */
const NAME_MAX = 120;
const SECTION_MAX = 80;
const LABEL_MAX = 80;
const CODE_MAX = 40;

/**
 * A field's code is the key its value is stored under in every encounter, so
 * it stays a plain identifier and never repeats inside one template.
 */
const CODE = /^[a-z][a-z0-9_]*$/;
const NUMBER = /^-?\d+(?:[.,]\d+)?$/;
const WHOLE = /^\d+$/;

const fieldSchema = z.object({
	label: requiredText("Informe o rótulo do campo.").max(
		LABEL_MAX,
		`O rótulo cabe em ${LABEL_MAX} caracteres.`,
	),
	code: z
		.string()
		.trim()
		.min(1, "Informe o código.")
		.max(CODE_MAX, `O código cabe em ${CODE_MAX} caracteres.`)
		.regex(CODE, "Use letras minúsculas, números e _, começando por letra."),
	fieldType: z.string().refine((value) => FIELD_TYPE_CODES.includes(value), {
		message: "Escolha o tipo do campo.",
	}),
	component: z.string(),
	variant: z.string(),
	required: z.boolean(),
	options: z.string(),
	min: z.string(),
	max: z.string(),
	maxLength: z.string(),
});

const sectionSchema = z.object({
	name: requiredText("Informe o nome da seção.").max(
		SECTION_MAX,
		`O nome cabe em ${SECTION_MAX} caracteres.`,
	),
	fields: z.array(fieldSchema),
});

export const templateSchema = z
	.object({
		name: requiredText("Informe o nome do modelo.").max(
			NAME_MAX,
			`O nome cabe em ${NAME_MAX} caracteres.`,
		),
		requiresModule: z.string(),
		sections: z.array(sectionSchema).min(1, "Inclua ao menos uma seção."),
	})
	.superRefine(({ sections }, context) => {
		const seen = new Set<string>();

		sections.forEach((section, at) => {
			section.fields.forEach((field, index) => {
				const path = ["sections", at, "fields", index];
				const issue = (key: string, message: string) =>
					context.addIssue({ code: "custom", path: [...path, key], message });

				if (seen.has(field.code)) {
					issue("code", "Outro campo deste modelo já usa este código.");
				}
				seen.add(field.code);

				for (const [key, message] of problemsOf(field)) {
					issue(key, message);
				}
			});
		});
	});

export type TemplateDraft = z.infer<typeof templateSchema>;
export type SectionDraft = TemplateDraft["sections"][number];
export type FieldDraft = SectionDraft["fields"][number];

/** The rules that depend on the field's type, each aimed at the input at fault. */
function problemsOf(field: FieldDraft): [string, string][] {
	const kind = kindOf(field.fieldType);

	if (kind === "choice" && linesOf(field.options).length === 0) {
		return [["options", "Liste ao menos uma opção, uma por linha."]];
	}

	if (kind === "component") {
		const component = componentOf(field.component);
		if (!component) {
			return [["component", "Escolha o componente."]];
		}
		if (component.declaresRegions && linesOf(field.options).length === 0) {
			return [["options", "Liste as regiões do mapa, uma por linha."]];
		}
	}

	if (kind === "number") {
		const problems: [string, string][] = [];
		if (field.min && !NUMBER.test(field.min)) {
			problems.push(["min", "Informe um número."]);
		}
		if (field.max && !NUMBER.test(field.max)) {
			problems.push(["max", "Informe um número."]);
		}
		if (
			problems.length === 0 &&
			field.min &&
			field.max &&
			numberOf(field.min) > numberOf(field.max)
		) {
			problems.push(["max", "O máximo não pode ser menor que o mínimo."]);
		}
		return problems;
	}

	if (kind === "text" && field.maxLength && !WHOLE.test(field.maxLength)) {
		return [["maxLength", "Informe um número inteiro de caracteres."]];
	}

	return [];
}

export const NEW_FIELD: FieldDraft = {
	label: "",
	code: "",
	fieldType: "SHORT_TEXT",
	component: "",
	variant: "permanent",
	required: false,
	options: "",
	min: "",
	max: "",
	maxLength: "",
};

export function newSection(): SectionDraft {
	return { name: "", fields: [{ ...NEW_FIELD }] };
}

export function emptyTemplate(): TemplateDraft {
	return { name: "", requiresModule: "", sections: [newSection()] };
}

/**
 * Suggests the code a label would be stored under: "Pressão arterial" becomes
 * "pressao_arterial".
 */
export function codeOf(label: string) {
	const code = label
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, CODE_MAX);

	return /^[a-z]/.test(code) ? code : code ? `campo_${code}` : "";
}

export function templateDraftOf(template: RecordTemplateView): TemplateDraft {
	return {
		name: template.name ?? "",
		requiresModule: template.requiresModule ?? "",
		sections: (template.sections ?? []).map((section) => ({
			name: section.name ?? "",
			fields: (section.fields ?? []).map(fieldDraftOf),
		})),
	};
}

function fieldDraftOf(field: FieldView): FieldDraft {
	const rules = field.validation ?? {};

	return {
		label: field.label ?? "",
		code: field.code ?? "",
		fieldType: field.fieldType ?? "SHORT_TEXT",
		component: field.component ?? "",
		variant: textOf(rules.variant) || "permanent",
		required: field.required ?? false,
		options: (field.options ?? []).join("\n"),
		min: textOf(rules.min),
		max: textOf(rules.max),
		maxLength: textOf(rules.maxLength),
	};
}

export function templateRequestOf(draft: TemplateDraft): RecordTemplateRequest {
	return {
		name: draft.name.trim(),
		requiresModule: draft.requiresModule || undefined,
		sections: draft.sections.map((section) => ({
			name: section.name.trim(),
			fields: section.fields.map(fieldRequestOf),
		})),
	};
}

/**
 * Sends only what the field's type reads: a choice its options, a number its
 * range, a text its length, a component the module it needs — so a field that
 * changed type carries none of its previous settings.
 */
function fieldRequestOf(field: FieldDraft): FieldRequest {
	const base = {
		code: field.code.trim(),
		label: field.label.trim(),
		fieldType: field.fieldType,
		required: field.required,
	};

	switch (kindOf(field.fieldType)) {
		case "choice":
			return { ...base, options: linesOf(field.options) };
		case "number":
			return {
				...base,
				validation: rulesOf({ min: field.min, max: field.max }),
			};
		case "text":
			return { ...base, validation: rulesOf({ maxLength: field.maxLength }) };
		case "component":
			return componentRequestOf(base, field);
		default:
			return base;
	}
}

function componentRequestOf(
	base: FieldRequest,
	field: FieldDraft,
): FieldRequest {
	const component = componentOf(field.component);

	return {
		...base,
		component: field.component,
		requiresModule: component?.module,
		...(component?.declaresRegions
			? { options: linesOf(field.options) }
			: { validation: { variant: field.variant } }),
	};
}

function rulesOf(rules: Record<string, string>) {
	const given = Object.entries(rules).filter(
		([, value]) => value.trim() !== "",
	);
	return given.length === 0
		? undefined
		: Object.fromEntries(given.map(([key, value]) => [key, numberOf(value)]));
}

function linesOf(text: string) {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line !== "");
}

function numberOf(value: string) {
	return Number(value.trim().replace(",", "."));
}

function textOf(value: unknown) {
	return value === undefined || value === null ? "" : String(value);
}

export function fieldCountOf(template: RecordTemplateView) {
	return (template.sections ?? []).reduce(
		(total, section) => total + (section.fields?.length ?? 0),
		0,
	);
}
