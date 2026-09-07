import { useState } from "react";
import { useRegisterPlatformAdministrator } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf, violationsOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextInput } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

const EMPTY = { name: "", email: "", password: "" };

export function Administrators() {
	const [draft, setDraft] = useState(EMPTY);
	const register = useRegisterPlatformAdministrator();

	const errors = violationsOf(register.error);
	const patch = (change: Partial<typeof EMPTY>) =>
		setDraft({ ...draft, ...change });

	function submit(event: React.FormEvent) {
		event.preventDefault();
		register.mutate({ body: draft }, { onSuccess: () => setDraft(EMPTY) });
	}

	return (
		<>
			<TopBar
				title="Administradores da plataforma"
				meta="Equipe Clivo com acesso a este console · não existe cadastro público"
			/>

			<Page>
				<div className="grid grid-cols-[1fr_1fr] items-start gap-4">
					<Panel className="p-5">
						<form onSubmit={submit} className="flex flex-col gap-5">
							<div className="flex flex-col gap-1">
								<span className="text-[13.5px] font-semibold text-ink">
									Adicionar administrador
								</span>
								<span className="text-[12px] text-muted">
									A pessoa entra com o e-mail e a senha inicial definidos aqui.
								</span>
							</div>

							<Field label="Nome" required error={errors.name}>
								{(id) => (
									<TextInput
										id={id}
										value={draft.name}
										onChange={(event) => patch({ name: event.target.value })}
										required
									/>
								)}
							</Field>

							<Field label="E-mail" required error={errors.email}>
								{(id) => (
									<TextInput
										id={id}
										type="email"
										value={draft.email}
										onChange={(event) => patch({ email: event.target.value })}
										required
									/>
								)}
							</Field>

							<Field
								label="Senha inicial"
								required
								error={errors.password}
								hint="Mínimo de 8 caracteres. Combine a troca no primeiro acesso."
							>
								{(id) => (
									<TextInput
										id={id}
										type="password"
										autoComplete="new-password"
										value={draft.password}
										onChange={(event) =>
											patch({ password: event.target.value })
										}
										minLength={8}
										required
									/>
								)}
							</Field>

							{register.isError ? (
								<Callout tone="danger">{messageOf(register.error)}</Callout>
							) : null}

							{register.isSuccess ? (
								<Callout tone="brand">
									Administrador criado. O acesso vale para todas as clínicas
									desta instância.
								</Callout>
							) : null}

							<div className="flex justify-end">
								<Button type="submit" disabled={register.isPending}>
									{register.isPending ? "Criando…" : "Criar administrador"}
								</Button>
							</div>
						</form>
					</Panel>

					<Panel>
						<PanelHeader
							title="O que este acesso concede"
							hint="Não existe perfil parcial neste console."
						/>
						<div className="flex flex-col gap-3 p-5">
							<p className="m-0 text-[12.5px] leading-relaxed text-muted">
								Administradores da plataforma enxergam todas as clínicas desta
								instância, os módulos contratados por cada uma e os parâmetros
								em vigor. Todo acesso a este console é criado por alguém já
								autorizado.
							</p>
							<Callout tone="warn" title="A listagem ainda não existe na API">
								A plataforma expõe apenas a criação de administradores. Enquanto
								não houver um endpoint de consulta, o console não tem como
								mostrar quem já tem acesso nem revogar um acesso concedido.
							</Callout>
						</div>
					</Panel>
				</div>
			</Page>
		</>
	);
}
