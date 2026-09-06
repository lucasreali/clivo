import { createFileRoute } from "@tanstack/react-router";
import { SignInForm } from "#/features/session/components/SignInForm";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-surface p-6">
			<SignInForm />
		</main>
	);
}
