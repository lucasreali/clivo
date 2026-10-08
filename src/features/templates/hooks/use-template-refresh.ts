import { useRefresh } from "#/api/use-refresh";

/**
 * The template list and each template are read under the same prefix, and the
 * parameters screen offers published templates as the clinic's default.
 */
const TEMPLATE_URLS = ["/api/record-templates", "/api/parameters"];

export function useTemplateRefresh() {
	return useRefresh(TEMPLATE_URLS);
}
