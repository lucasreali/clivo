import type { Tone } from "#/shared/ui/tone";

type StatusDescription = { label: string; tone: Tone; action: string };

export const APPOINTMENT_STATUS = {
	SCHEDULED: {
		label: "Awaiting confirmation",
		tone: "warn",
		action: "Confirm",
	},
	CONFIRMED: {
		label: "Confirmed",
		tone: "brand",
		action: "Check in",
	},
	ARRIVED: { label: "Arrived", tone: "info", action: "Start" },
	IN_PROGRESS: {
		label: "In progress",
		tone: "brand",
		action: "Open record",
	},
	COMPLETED: { label: "Completed", tone: "neutral", action: "View record" },
	CANCELLED: { label: "Cancelled", tone: "neutral", action: "Reschedule" },
	NO_SHOW: { label: "No-show", tone: "danger", action: "Reschedule" },
} as const satisfies Record<string, StatusDescription>;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS;

const UNKNOWN = { label: "—", tone: "neutral", action: "Open" } as const;

export function describeStatus(status: string | undefined) {
	return APPOINTMENT_STATUS[status as AppointmentStatus] ?? UNKNOWN;
}

export function awaitsArrival(status: string | undefined) {
	return status === "SCHEDULED" || status === "CONFIRMED";
}

export function occupiesAgenda(status: string | undefined) {
	return (
		awaitsArrival(status) || status === "ARRIVED" || status === "IN_PROGRESS"
	);
}

export function isUnderway(status: string | undefined) {
	return status === "IN_PROGRESS";
}
