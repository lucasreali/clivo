import type { Tone } from "#/shared/ui/tone";

export const APPOINTMENT_STATUS = {
	SCHEDULED: { label: "Agendado", tone: "warn" },
	CONFIRMED: { label: "Confirmado", tone: "brand" },
	ARRIVED: { label: "Chegou", tone: "info" },
	IN_PROGRESS: { label: "Em atendimento", tone: "brand" },
	COMPLETED: { label: "Concluído", tone: "neutral" },
	CANCELLED: { label: "Cancelado", tone: "neutral" },
	NO_SHOW: { label: "Falta", tone: "danger" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS;

const UNKNOWN = { label: "—", tone: "neutral" } as const;

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
