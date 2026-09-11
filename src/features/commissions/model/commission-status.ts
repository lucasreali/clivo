import type { Tone } from "#/shared/ui/tone";

const STATUS: Record<string, { label: string; tone: Tone }> = {
	OPEN: { label: "Em aberto", tone: "warn" },
	CLOSED: { label: "Fechada", tone: "brand" },
};

export function describeCommissionStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}
