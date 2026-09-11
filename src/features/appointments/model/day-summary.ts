import type { AppointmentView } from "#/api/gen/types";
import type { Tone } from "#/shared/ui/tone";

type Counter = { label: string; value: number; tone: Tone };

export function summarise(appointments: readonly AppointmentView[]): Counter[] {
	const countOf = (...statuses: string[]) =>
		appointments.filter((appointment) =>
			statuses.includes(appointment.status ?? ""),
		).length;

	return [
		{ label: "Scheduled today", value: appointments.length, tone: "neutral" },
		{
			label: "Awaiting confirmation",
			value: countOf("SCHEDULED"),
			tone: "warn",
		},
		{
			label: "At the front desk",
			value: countOf("ARRIVED", "IN_PROGRESS"),
			tone: "info",
		},
		{ label: "Completed", value: countOf("COMPLETED"), tone: "brand" },
		{ label: "No-shows", value: countOf("NO_SHOW"), tone: "danger" },
	];
}
