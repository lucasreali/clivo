import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignIn } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextInput } from "#/shared/ui/Field";

export function SignInForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [clinic, setClinic] = useState("");
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

	function submit(event: React.FormEvent) {
		event.preventDefault();
		signIn.mutate({ body: { email, password, clinic: clinic || undefined } });
	}

	return (
		<form
			onSubmit={submit}
			className="flex w-[400px] flex-col gap-5 rounded-xl border border-line bg-panel p-7"
		>
			<div className="flex flex-col gap-1.5">
				<span className="flex items-center gap-2 text-[20px] font-semibold tracking-[1.6px] text-ink">
					<span className="h-2.5 w-2.5 rounded-sm bg-brand" />
					CLIVO
				</span>
				<span className="text-[12.5px] text-muted">
					Entre com a conta da sua clínica
				</span>
			</div>

			<Field label="E-mail" required>
				{(id) => (
					<TextInput
						id={id}
						type="email"
						autoComplete="username"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
				)}
			</Field>

			<Field label="Senha" required>
				{(id) => (
					<TextInput
						id={id}
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
				)}
			</Field>

			<Field
				label="Clínica"
				hint="Informe apenas se o seu acesso atende mais de uma unidade."
			>
				{(id) => (
					<TextInput
						id={id}
						value={clinic}
						onChange={(event) => setClinic(event.target.value)}
					/>
				)}
			</Field>

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
