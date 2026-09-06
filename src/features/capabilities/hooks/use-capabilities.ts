import { useMemo } from "react";
import { useGetCapabilities } from "#/api/gen/hooks";
import { Capabilities } from "../model/capabilities";

export function useCapabilities() {
	const { data, isPending } = useGetCapabilities({
		query: { staleTime: 5 * 60_000 },
	});

	const capabilities = useMemo(() => Capabilities.from(data), [data]);

	return { capabilities, isPending };
}
