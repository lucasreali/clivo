import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentSessionQueryOptions } from "#/api/gen/hooks";
import { ConsoleShell } from "#/features/platform/components/ConsoleShell";
import { statusOf } from "#/shared/api-error";

export const Route = createFileRoute("/console/_console")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient
			.ensureQueryData(getCurrentSessionQueryOptions())
			.catch(rejectUnauthenticated);

		return { session };
	},
	component: ConsoleLayout,
});

function rejectUnauthenticated(error: unknown): never {
	if (statusOf(error) === 401) {
		throw redirect({ to: "/console/entrar" });
	}
	throw error;
}

function ConsoleLayout() {
	const { session } = Route.useRouteContext();

	return (
		<ConsoleShell
			user={session.name ?? "Equipe Clivo"}
			role={session.role ?? "Plataforma"}
		>
			<Outlet />
		</ConsoleShell>
	);
}
