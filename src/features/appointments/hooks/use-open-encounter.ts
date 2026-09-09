import { useListCustomerEncounters } from "#/api/gen/hooks";
import type { AppointmentView } from "#/api/gen/types";
import { isUnderway } from "../model/appointment-status";

export function useOpenEncounter(appointment: AppointmentView) {
	const history = useListCustomerEncounters(
		{ query: { customerId: appointment.customerId as string } },
		{ query: { enabled: isUnderway(appointment.status) } },
	);

	const match = (history.data?.encounters ?? []).find(
		(encounter) =>
			!encounter.completedAt &&
			encounter.practitionerId === appointment.practitionerId,
	);

	return match?.id;
}
