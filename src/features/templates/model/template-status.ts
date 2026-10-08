import type { Tone } from "#/shared/ui/tone";

/**
 * Mirrors the API's `RecordTemplateStatus`. A draft is edited in place; a
 * published version is frozen, and editing it starts the next version as a
 * draft; publishing a version retires the one it replaces.
 */
const STATUS: Record<string, { label: string; tone: Tone }> = {
	DRAFT: { label: "Rascunho", tone: "warn" },
	PUBLISHED: { label: "Publicado", tone: "brand" },
	RETIRED: { label: "Aposentado", tone: "neutral" },
};

export function describeTemplateStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}

export function isDraft(status: string | undefined) {
	return status === "DRAFT";
}

export function isPublished(status: string | undefined) {
	return status === "PUBLISHED";
}
