import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	changeClinicParameter,
	clinicParametersQueryOptions,
	scopesClinic,
} from "../api/clinic-scope";

type ParameterChange = { code: string; value: string };

export function useClinicParameters(tenantId: string) {
	const queryClient = useQueryClient();
	const parameters = useQuery(clinicParametersQueryOptions(tenantId));

	const change = useMutation({
		mutationFn: ({ code, value }: ParameterChange) =>
			changeClinicParameter(tenantId, code, value),
		onSuccess: () =>
			queryClient.invalidateQueries({
				predicate: (query) => scopesClinic(query.queryKey, tenantId),
			}),
	});

	return {
		parameters: parameters.data ?? [],
		isPending: parameters.isPending,
		isSaving: change.isPending,
		error: change.error,
		change: change.mutateAsync,
	};
}
