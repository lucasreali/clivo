import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as z from "zod";
import { useSignIn } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { requiredEmail, requiredText } from "#/shared/form/schema";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Logo } from "#/shared/ui/Logo";

const credentialsSchema = z.object({
	email: requiredEmail,
	password: requiredText("Enter the password."),
});

export function ConsoleSignIn() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const signIn = useSignIn({
		mutation: {
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				await navigate({ to: "/console" });
			},
		},
	});

	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		...validatedBy(credentialsSchema),
		onSubmit: ({ value }) => signIn.mutate({ body: value }),
	});

	return (
		<form
			onSubmit={submitHandler(form)}
			noValidate
			className="flex w-[400px] flex-col gap-5 rounded-xl border border-line bg-panel p-7"
		>
			<div className="flex flex-col gap-1.5">
				<span className="flex items-center gap-2">
					<Logo size="lg" />
					<span className="rounded border border-line px-1.5 py-0.5 text-[10px] font-medium tracking-[1.1px] text-muted">
						CONSOLE
					</span>
				</span>
				<span className="text-[13.5px] font-semibold text-ink">
					Administration console
				</span>
				<span className="text-[12.5px] text-muted">
					Your credentials define which clinics you can reach.
				</span>
			</div>

			{signIn.isError ? (
				<Callout tone="danger" title="Could not sign in">
					{messageOf(signIn.error)}
				</Callout>
			) : null}

			<form.AppField name="email">
				{(field) => (
					<field.TextField
						label="Email"
						type="email"
						inputMode="email"
						autoComplete="username"
						required
					/>
				)}
			</form.AppField>

			<form.AppField name="password">
				{(field) => (
					<field.TextField
						label="Password"
						type="password"
						autoComplete="current-password"
						required
					/>
				)}
			</form.AppField>

			<Button type="submit" disabled={signIn.isPending} className="h-[38px]">
				{signIn.isPending ? "Signing in…" : "Sign in"}
			</Button>

			<span className="text-center text-[11.5px] text-faint">
				Restricted to the Clivo team · there is no public sign-up.
			</span>
		</form>
	);
}
