import { useQueryClient } from "@tanstack/react-query";

/**
 * Generated query keys are objects, so invalidation matches on the url the key
 * carries. A movement changes the product's balance, its own history and the
 * batches behind it, so all three listings are dropped together.
 */
const INVENTORY_URLS = ["/api/products", "/api/batches/expiring"];

export function useInventoryRefresh() {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({
			predicate: (query) => touchesInventory(query.queryKey),
		});
}

function touchesInventory(queryKey: readonly unknown[]) {
	const head = queryKey[0];
	if (typeof head !== "object" || head === null) {
		return false;
	}

	const url = (head as { url?: string }).url;
	return (
		url !== undefined && INVENTORY_URLS.some((prefix) => url.startsWith(prefix))
	);
}
