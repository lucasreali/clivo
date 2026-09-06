import { useQueryClient } from "@tanstack/react-query";
import {
	useCancelAppointment,
	useCheckInAppointment,
	useMarkAppointmentNoShow,
	useRescheduleAppointment,
} from "#/api/gen/hooks";

const APPOINTMENT_URLS = ["/api/appointments", "/api/schedule-blocks"];

export function useAppointmentActions() {
	const refresh = useAppointmentRefresh();

	return {
		checkIn: useCheckInAppointment({ mutation: { onSuccess: refresh } }),
		markNoShow: useMarkAppointmentNoShow({ mutation: { onSuccess: refresh } }),
		cancel: useCancelAppointment({ mutation: { onSuccess: refresh } }),
		reschedule: useRescheduleAppointment({ mutation: { onSuccess: refresh } }),
	};
}

export function useAppointmentRefresh() {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({
			predicate: (query) => touchesAppointments(query.queryKey),
		});
}

function touchesAppointments(queryKey: readonly unknown[]) {
	const head = queryKey[0];
	if (typeof head !== "object" || head === null) {
		return false;
	}

	const url = (head as { url?: string }).url;
	return url !== undefined && APPOINTMENT_URLS.includes(url);
}
