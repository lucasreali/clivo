import { useRefresh } from "#/api/use-refresh";

/**
 * The plan catalogue also feeds the customer's enrolment picker and the
 * memberships it lists, so a change drops both.
 */
const PLAN_URLS = ["/api/insurance-plans", "/api/insurance-memberships"];

export function usePlanRefresh() {
	return useRefresh(PLAN_URLS);
}
