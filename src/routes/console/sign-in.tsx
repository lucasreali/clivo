import { createFileRoute } from "@tanstack/react-router";
import { ConsoleSignIn } from "#/features/platform/components/ConsoleSignIn";

export const Route = createFileRoute("/console/sign-in")({
	component: ConsoleSignInPage,
});

function ConsoleSignInPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-surface p-6">
			<ConsoleSignIn />
		</main>
	);
}
