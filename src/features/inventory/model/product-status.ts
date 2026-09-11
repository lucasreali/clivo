import type { Tone } from "#/shared/ui/tone";

const STATUS: Record<string, { label: string; tone: Tone }> = {
	ACTIVE: { label: "Ativo", tone: "brand" },
	INACTIVE: { label: "Inativo", tone: "neutral" },
};

export function describeProductStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}
