import { queryOptions } from "@tanstack/react-query";
import { client } from "#/api/client";
import type {
	PlatformModuleChangeView,
	PlatformModuleView,
	PlatformParameterView,
} from "#/api/gen/types";

// The API resolves the clinic from the URL in a servlet interceptor instead of
// a handler argument, so springdoc leaves `tenantId` out of these operations
// and the generated clients have nowhere to put it. Until the document
// declares the variable, the console addresses these routes itself and keeps
// the clinic in the query key so two clinics never share a cache entry.
const MODULES = "/api/platform/tenants/{tenantId}/modules";
const MODULE_HISTORY = `${MODULES}/history`;
const MODULE_ACTIVATION = `${MODULES}/{code}/activation`;
const PARAMETERS = "/api/platform/tenants/{tenantId}/parameters";
const ONE_PARAMETER = `${PARAMETERS}/{code}`;

export function clinicModulesQueryOptions(tenantId: string) {
	return queryOptions({
		queryKey: keyOf(MODULES, tenantId),
		queryFn: ({ signal }) =>
			read<PlatformModuleView[]>(MODULES, tenantId, signal),
	});
}

export function clinicModuleHistoryQueryOptions(tenantId: string) {
	return queryOptions({
		queryKey: keyOf(MODULE_HISTORY, tenantId),
		queryFn: ({ signal }) =>
			read<PlatformModuleChangeView[]>(MODULE_HISTORY, tenantId, signal),
	});
}

export function clinicParametersQueryOptions(tenantId: string) {
	return queryOptions({
		queryKey: keyOf(PARAMETERS, tenantId),
		queryFn: ({ signal }) =>
			read<PlatformParameterView[]>(PARAMETERS, tenantId, signal),
	});
}

export function activateClinicModule(tenantId: string, code: string) {
	return send("PUT", MODULE_ACTIVATION, { tenantId, code });
}

export function deactivateClinicModule(tenantId: string, code: string) {
	return send("DELETE", MODULE_ACTIVATION, { tenantId, code });
}

export function changeClinicParameter(
	tenantId: string,
	code: string,
	value: string,
) {
	return send("PUT", ONE_PARAMETER, { tenantId, code }, { value });
}

export function scopesClinic(queryKey: readonly unknown[], tenantId: string) {
	const scope = queryKey[0] as { params?: { tenantId?: string } } | undefined;
	return scope?.params?.tenantId === tenantId;
}

function keyOf(url: string, tenantId: string) {
	return [{ url, params: { tenantId } }] as const;
}

async function read<T>(url: string, tenantId: string, signal: AbortSignal) {
	const answer = await client({
		method: "GET",
		url,
		path: { tenantId },
		signal,
	});
	return answer.data as T;
}

function send(
	method: "PUT" | "DELETE",
	url: string,
	path: Record<string, string>,
	body?: unknown,
) {
	return client({ method, url, path, body });
}
