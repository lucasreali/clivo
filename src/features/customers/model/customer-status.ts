import type { Tone } from "#/shared/ui/tone";

const STATUS: Record<string, { label: string; tone: Tone }> = {
	ACTIVE: { label: "Active", tone: "brand" },
	INACTIVE: { label: "Inactive", tone: "neutral" },
};

export function describeCustomerStatus(status: string | undefined) {
	return STATUS[status ?? ""] ?? { label: "—", tone: "neutral" as Tone };
}
