import { useRefresh } from "#/api/use-refresh";

/**
 * The catalogue also feeds the agenda's booking drawer and the day panel, so a
 * change to a service drops those listings with it.
 */
const SERVICE_URLS = ["/api/services", "/api/appointments"];

export function useServiceRefresh() {
	return useRefresh(SERVICE_URLS);
}
