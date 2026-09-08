import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	useActivateClinic,
	useDeactivateClinic,
	useListClinics,
	useProvisionClinic,
} from "#/api/gen/hooks";
import { ClinicCatalog } from "../model/clinic-catalog";

export function useClinicCatalog() {
	const clinics = useListClinics();
	const catalog = useMemo(
		() => ClinicCatalog.from(clinics.data),
		[clinics.data],
	);

	return {
		catalog,
		isPending: clinics.isPending,
		error: clinics.error,
	};
}

export function useClinicLifecycle(tenantId: string) {
	const queryClient = useQueryClient();
	const refresh = () => queryClient.invalidateQueries();

	const activate = useActivateClinic({ mutation: { onSuccess: refresh } });
	const deactivate = useDeactivateClinic({ mutation: { onSuccess: refresh } });

	return {
		activate: () => activate.mutate({ path: { tenantId } }),
		deactivate: (reason: string, onSuspended: () => void) =>
			deactivate.mutate(
				{ path: { tenantId }, body: { reason } },
				{ onSuccess: onSuspended },
			),
		isPending: activate.isPending || deactivate.isPending,
		error: activate.error ?? deactivate.error,
	};
}

export function useClinicOnboarding() {
	const queryClient = useQueryClient();

	return useProvisionClinic({
		mutation: { onSuccess: () => queryClient.invalidateQueries() },
	});
}
