import { useRefresh } from "#/api/use-refresh";

/**
 * A practitioner's name and availability also feed the agenda, the day panel and
 * the commission rates, so a change drops every listing that names them.
 */
const PRACTITIONER_URLS = [
	"/api/practitioners",
	"/api/appointments",
	"/api/commission-rates",
];

export function usePractitionerRefresh() {
	return useRefresh(PRACTITIONER_URLS);
}
