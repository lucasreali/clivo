import { useNavigate } from "@tanstack/react-router";
import { useOpenEncounter } from "#/api/gen/hooks";
import type { AppointmentView } from "#/api/gen/types";
import { useCapabilities } from "#/features/capabilities/hooks/use-capabilities";
import { useAppointmentRefresh } from "./use-appointment-actions";

const DEFAULT_TEMPLATE = "default_record_template";

export function useStartEncounter() {
	const { capabilities } = useCapabilities();
	const navigate = useNavigate();
	const refresh = useAppointmentRefresh();

	const open = useOpenEncounter({
		mutation: {
			onSuccess: async (encounter) => {
				await refresh();
				await navigate({
					to: "/encounters/$encounterId",
					params: { encounterId: String(encounter.id) },
				});
			},
		},
	});

	function start(appointment: AppointmentView) {
		open.mutate({
			body: {
				appointmentId: appointment.id,
				customerId: appointment.customerId,
				practitionerId: appointment.practitionerId,
				serviceId: appointment.serviceId,
				recordTemplateId: capabilities.parameters.text(DEFAULT_TEMPLATE, ""),
			},
		});
	}

	return { start, isPending: open.isPending, error: open.error };
}
