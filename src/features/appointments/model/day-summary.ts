import type { AppointmentView } from "#/api/gen/types";
import type { Tone } from "#/shared/ui/tone";

type Counter = { label: string; value: number; tone: Tone };

export function summarise(appointments: readonly AppointmentView[]): Counter[] {
	const countOf = (...statuses: string[]) =>
		appointments.filter((appointment) =>
			statuses.includes(appointment.status ?? ""),
		).length;

	return [
		{ label: "Agendados hoje", value: appointments.length, tone: "neutral" },
		{
			label: "Aguardando confirmação",
			value: countOf("SCHEDULED"),
			tone: "warn",
		},
		{ label: "Na recepção", value: countOf("ARRIVED"), tone: "info" },
		{ label: "Em atendimento", value: countOf("IN_PROGRESS"), tone: "brand" },
		{ label: "Concluídos", value: countOf("COMPLETED"), tone: "brand" },
		{ label: "Faltas", value: countOf("NO_SHOW"), tone: "danger" },
	];
}
