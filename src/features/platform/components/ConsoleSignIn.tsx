import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignIn } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextInput } from "#/shared/ui/Field";

export function ConsoleSignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
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

	function submit(event: React.FormEvent) {
		event.preventDefault();
		signIn.mutate({ body: { email, password } });
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

			<Button type="submit" disabled={signIn.isPending} className="h-[38px]">
				{signIn.isPending ? "Entrando…" : "Entrar"}
			</Button>

			<span className="text-center text-[11.5px] text-faint">
				Acesso restrito à equipe Clivo · não há cadastro público.
			</span>
		</form>
	);
}
