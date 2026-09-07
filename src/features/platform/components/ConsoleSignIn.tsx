import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSignIn } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { FormTextField } from "#/shared/form/fields";
import { requiredEmail, requiredText } from "#/shared/form/schema";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";

const credentialsSchema = z.object({
	email: requiredEmail,
	password: requiredText("Informe a senha."),
});

type Credentials = z.infer<typeof credentialsSchema>;

export function ConsoleSignIn() {
	const form = useForm<Credentials>({
		resolver: zodResolver(credentialsSchema),
		mode: "onTouched",
		defaultValues: { email: "", password: "" },
	});
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

	const submit = form.handleSubmit((values) => signIn.mutate({ body: values }));

	return (
		<form
			onSubmit={submit}
			noValidate
			className="flex w-[400px] flex-col gap-5 rounded-xl border border-line bg-panel p-7"
		>
			<div className="flex flex-col gap-1.5">
				<span className="flex items-center gap-2 text-[20px] font-semibold tracking-[1.6px] text-ink">
					<span className="h-2.5 w-2.5 rounded-sm bg-brand" />
					CLIVO
					<span className="ml-1 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium tracking-[1.1px] text-muted">
						CONSOLE
					</span>
				</span>
				<span className="text-[13.5px] font-semibold text-ink">
					Console de administração
				</span>
				<span className="text-[12.5px] text-muted">
					Suas credenciais definem a que clínicas você tem acesso.
				</span>
			</div>

			{signIn.isError ? (
				<Callout tone="danger" title="Não foi possível entrar">
					{messageOf(signIn.error)}
				</Callout>
			) : null}

			<FormTextField
				control={form.control}
				name="email"
				label="E-mail"
				type="email"
				inputMode="email"
				autoComplete="username"
				required
			/>

			<FormTextField
				control={form.control}
				name="password"
				label="Senha"
				type="password"
				autoComplete="current-password"
				required
			/>

			<Button type="submit" disabled={signIn.isPending} className="h-[38px]">
				{signIn.isPending ? "Entrando…" : "Entrar"}
			</Button>

			<span className="text-center text-[11.5px] text-faint">
				Acesso restrito à equipe Clivo · não há cadastro público.
			</span>
		</form>
	);
}
