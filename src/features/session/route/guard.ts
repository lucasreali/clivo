import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { getCurrentSessionQueryOptions } from "#/api/gen/hooks";
import type { SessionView } from "#/api/gen/types";
import { statusOf } from "#/shared/api-error";
import { Access } from "../model/access";

type RouteContext = { queryClient: QueryClient };

type SignInPath = "/login" | "/console/entrar";

export async function requireClinicSession({ queryClient }: RouteContext) {
	const session = await resolveSession(queryClient, "/login");

	if (!Access.of(session).belongsToClinic()) {
		throw redirect({ to: "/console" });
	}

	return { session };
}

export async function requireConsoleSession({ queryClient }: RouteContext) {
	const session = await resolveSession(queryClient, "/console/entrar");

	if (!Access.of(session).administersPlatform()) {
		throw redirect({ to: "/" });
	}

	return { session };
}

function resolveSession(
	queryClient: QueryClient,
	signIn: SignInPath,
): Promise<SessionView> {
	return queryClient
		.ensureQueryData(getCurrentSessionQueryOptions())
		.catch((error: unknown) => rejectUnauthenticated(error, signIn));
}

function rejectUnauthenticated(error: unknown, signIn: SignInPath): never {
	if (statusOf(error) === 401) {
		throw redirect({ to: signIn });
	}
	throw error;
}
