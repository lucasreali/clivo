import type { Tone } from "#/shared/ui/tone";

type StatusDescription = { label: string; tone: Tone; action: string };

export const APPOINTMENT_STATUS = {
	SCHEDULED: {
		label: "Aguardando confirmação",
		tone: "warn",
		action: "Confirmar",
	},
	CONFIRMED: {
		label: "Confirmado",
		tone: "brand",
		action: "Registrar chegada",
	},
	ARRIVED: { label: "Chegou", tone: "info", action: "Iniciar" },
	IN_PROGRESS: {
		label: "Em atendimento",
		tone: "brand",
		action: "Abrir ficha",
	},
	COMPLETED: { label: "Concluído", tone: "neutral", action: "Ver ficha" },
	CANCELLED: { label: "Cancelado", tone: "neutral", action: "Reagendar" },
	NO_SHOW: { label: "Falta", tone: "danger", action: "Reagendar" },
} as const satisfies Record<string, StatusDescription>;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS;

const UNKNOWN = { label: "—", tone: "neutral", action: "Abrir" } as const;

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
