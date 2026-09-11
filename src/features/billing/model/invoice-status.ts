import type { Tone } from "#/shared/ui/tone";

const STATUS: Record<string, { label: string; tone: Tone }> = {
	OPEN: { label: "Awaiting payment", tone: "warn" },
	PARTIAL: { label: "Partially paid", tone: "info" },
	PAID: { label: "Paid", tone: "brand" },
	CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export function describeInvoiceStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}
