import type { Tone } from "#/shared/ui/tone";

const STATUS: Record<string, { label: string; tone: Tone }> = {
	AVAILABLE: { label: "Disponível", tone: "brand" },
	RESERVED: { label: "Reservado", tone: "info" },
	DISCARDED: { label: "Descartado", tone: "neutral" },
};

export function describeBatchStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}
