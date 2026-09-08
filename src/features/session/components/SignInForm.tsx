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
	password: requiredText("Informe a senha."),
});

export function SignInForm() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const signIn = useSignIn({
		mutation: {
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				await navigate({ to: "/" });
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
				<Logo size="lg" />
				<span className="text-[12.5px] text-muted">
					Entre com a conta da sua clínica
				</span>
			</div>

			<form.AppField name="email">
				{(field) => (
					<field.TextField
						label="E-mail"
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
						label="Senha"
						type="password"
						autoComplete="current-password"
						required
					/>
				)}
			</form.AppField>

			{signIn.isError ? (
				<Callout tone="danger">{messageOf(signIn.error)}</Callout>
			) : null}

			<Button type="submit" disabled={signIn.isPending} className="h-[38px]">
				{signIn.isPending ? "Entrando…" : "Entrar"}
			</Button>

			<span className="text-center text-[11.5px] text-faint">
				Acesso restrito à equipe da clínica. Uso monitorado conforme a LGPD.
			</span>
		</form>
	);
}
