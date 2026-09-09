import { useListCustomerEncounters } from "#/api/gen/hooks";

export function usePreviousEncounters(
	customerId: string | undefined,
	encounterId: string,
) {
	const history = useListCustomerEncounters(
		{ query: { customerId: customerId as string } },
		{ query: { enabled: Boolean(customerId) } },
	);

	return (history.data?.encounters ?? [])
		.filter((encounter) => encounter.id !== encounterId && encounter.startedAt)
		.sort((one, other) =>
			(other.startedAt ?? "").localeCompare(one.startedAt ?? ""),
		);
}
