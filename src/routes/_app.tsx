import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentSessionQueryOptions } from "#/api/gen/hooks";
import { AppShell } from "#/features/navigation/components/AppShell";
import { labelOfRole } from "#/features/settings/model/role";
import { statusOf } from "#/shared/api-error";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient
			.ensureQueryData(getCurrentSessionQueryOptions())
			.catch(rejectUnauthenticated);

		return { session };
	},
	component: AppLayout,
});

function rejectUnauthenticated(error: unknown): never {
	if (statusOf(error) === 401) {
		throw redirect({ to: "/login" });
	}
	throw error;
}

function AppLayout() {
	const { session } = Route.useRouteContext();

	return (
		<AppShell
			user={session.name ?? "Equipe"}
			role={labelOfRole(session.role)}
			clinic={session.clinic?.name ?? "Clínica"}
		>
			<Outlet />
		</AppShell>
	);
}
