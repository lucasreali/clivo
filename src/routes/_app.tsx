import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "#/features/navigation/components/AppShell";
import { requireClinicSession } from "#/features/session/route/guard";
import { labelOfRole } from "#/features/settings/model/role";

export const Route = createFileRoute("/_app")({
	beforeLoad: ({ context }) => requireClinicSession(context),
	component: AppLayout,
});

function AppLayout() {
	const { session } = Route.useRouteContext();

	return (
		<AppShell
			user={session.name ?? "Team"}
			role={labelOfRole(session.role)}
			clinic={session.clinic?.name ?? "Clinic"}
		>
			<Outlet />
		</AppShell>
	);
}
