import { createFileRoute } from "@tanstack/react-router";
import { ConsoleSignIn } from "#/features/platform/components/ConsoleSignIn";

export const Route = createFileRoute("/console/entrar")({
	component: ConsoleLoginPage,
});

function ConsoleLoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-surface p-6">
			<ConsoleSignIn />
		</main>
	);
}
