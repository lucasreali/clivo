import { QueryClient } from "@tanstack/react-query";
import { ResponseError } from "./gen/.kubb/client";

const AUTH_FAILURES = [401, 403];

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60_000,
				retry: (failureCount, error) =>
					!isAuthFailure(error) && failureCount < 2,
			},
		},
	});
}

function isAuthFailure(error: unknown) {
	return error instanceof ResponseError && AUTH_FAILURES.includes(error.status);
}
