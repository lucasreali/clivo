import { useQueryClient } from "@tanstack/react-query";

/**
 * Generated query keys are objects (`{ url, params }`), so invalidation matches
 * on the url the key carries. A screen names the endpoints its change touches
 * and every listing under them is dropped together — including the ones another
 * feature reads, such as the agenda's practitioner and service pickers.
 */
export function useRefresh(urls: readonly string[]) {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({
			predicate: (query) => touches(query.queryKey, urls),
		});
}

function touches(queryKey: readonly unknown[], urls: readonly string[]) {
	const head = queryKey[0];
	if (typeof head !== "object" || head === null) {
		return false;
	}

	const url = (head as { url?: string }).url;
	return url !== undefined && urls.some((prefix) => url.startsWith(prefix));
}
