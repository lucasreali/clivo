import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	activateClinicModule,
	clinicModuleHistoryQueryOptions,
	clinicModulesQueryOptions,
	deactivateClinicModule,
	scopesClinic,
} from "../api/clinic-scope";
import { ModuleCatalog } from "../model/module-catalog";

export function useClinicModules(tenantId: string) {
	const queryClient = useQueryClient();
	const modules = useQuery(clinicModulesQueryOptions(tenantId));
	const catalog = useMemo(
		() => ModuleCatalog.from(modules.data),
		[modules.data],
	);
	const history = useQuery(clinicModuleHistoryQueryOptions(tenantId));

	const refresh = () =>
		queryClient.invalidateQueries({
			predicate: (query) => scopesClinic(query.queryKey, tenantId),
		});

	const activate = useMutation({
		mutationFn: (code: string) => activateClinicModule(tenantId, code),
		onSuccess: refresh,
	});
	const deactivate = useMutation({
		mutationFn: (code: string) => deactivateClinicModule(tenantId, code),
		onSuccess: refresh,
	});

	return {
		catalog,
		history: history.data ?? [],
		isPending: modules.isPending,
		isSaving: activate.isPending || deactivate.isPending,
		error: activate.error ?? deactivate.error,
		activate: activate.mutateAsync,
		deactivate: deactivate.mutateAsync,
	};
}
