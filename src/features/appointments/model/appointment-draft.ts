import * as z from "zod";
import type { AppointmentRequest } from "#/api/gen/types";
import { requiredText } from "#/shared/form/schema";
import { toInstant } from "#/shared/format/date";

export const appointmentSchema = z.object({
	customerId: requiredText("Choose the patient."),
	practitionerId: requiredText("Choose the practitioner."),
	serviceId: requiredText("Choose the service."),
	date: requiredText("Enter the date."),
	time: requiredText("Enter the time."),
});

export type AppointmentDraft = z.infer<typeof appointmentSchema>;

export function emptyAppointmentDraft(day: string): AppointmentDraft {
	return {
		customerId: "",
		practitionerId: "",
		serviceId: "",
		date: day,
		time: "09:00",
	};
}

export function appointmentRequestOf(
	draft: AppointmentDraft,
): AppointmentRequest {
	return {
		customerId: draft.customerId,
		practitionerId: draft.practitionerId,
		serviceId: draft.serviceId,
		start: toInstant(draft.date, draft.time),
	};
}
