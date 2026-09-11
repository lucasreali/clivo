import { useQueryClient } from "@tanstack/react-query";

/**
 * Closing a month freezes what is owed, and changing a rate changes what the
 * next month will owe, so both drop the statement and the rate list together.
 */
const COMMISSION_URLS = ["/api/commissions", "/api/commission-rates"];

export function useCommissionRefresh() {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({
			predicate: (query) => touchesCommissions(query.queryKey),
		});
}

function touchesCommissions(queryKey: readonly unknown[]) {
	const head = queryKey[0];
	if (typeof head !== "object" || head === null) {
		return false;
	}

	const url = (head as { url?: string }).url;
	return (
		url !== undefined &&
		COMMISSION_URLS.some((prefix) => url.startsWith(prefix))
	);
}
