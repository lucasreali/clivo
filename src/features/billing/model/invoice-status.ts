import type { Tone } from "#/shared/ui/tone";

const STATUS: Record<string, { label: string; tone: Tone }> = {
	OPEN: { label: "Aguardando recebimento", tone: "warn" },
	PARTIAL: { label: "Parcialmente pago", tone: "info" },
	PAID: { label: "Pago", tone: "brand" },
	CANCELLED: { label: "Cancelada", tone: "neutral" },
};

export function describeInvoiceStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}
