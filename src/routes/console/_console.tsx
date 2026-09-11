import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ConsoleShell } from "#/features/platform/components/ConsoleShell";
import { requireConsoleSession } from "#/features/session/route/guard";

export const Route = createFileRoute("/console/_console")({
	beforeLoad: ({ context }) => requireConsoleSession(context),
	component: ConsoleLayout,
});

function ConsoleLayout() {
	const { session } = Route.useRouteContext();

	return (
		<ConsoleShell
			user={session.name ?? "Clivo team"}
			role={session.role ?? "Platform"}
		>
			<Outlet />
		</ConsoleShell>
	);
}
