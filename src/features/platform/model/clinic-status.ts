import type { Tone } from "#/shared/ui/tone";

type Situation = { label: string; tone: Tone };

const STATUS: Record<string, Situation> = {
	ACTIVE: { label: "Active", tone: "brand" },
	SUSPENDED: { label: "Suspended", tone: "warn" },
	CLOSED: { label: "Closed", tone: "neutral" },
};

const UNKNOWN: Situation = { label: "—", tone: "neutral" };

export const CLINIC_SITUATIONS = Object.entries(STATUS).map(
	([status, situation]) => ({ status, label: situation.label }),
);

export function describeClinicStatus(status: string | undefined): Situation {
	return STATUS[status ?? ""] ?? UNKNOWN;
}

export function isInService(status: string | undefined) {
	return status === "ACTIVE";
}
