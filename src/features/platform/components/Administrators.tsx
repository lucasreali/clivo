import * as z from "zod";
import { useRegisterPlatformAdministrator } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { password, requiredEmail, requiredText } from "#/shared/form/schema";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

const administratorSchema = z.object({
	name: requiredText("Informe o nome."),
	email: requiredEmail,
	password: password(),
});

type AdministratorDraft = z.infer<typeof administratorSchema>;

const EMPTY: AdministratorDraft = { name: "", email: "", password: "" };

export function Administrators() {
	const register = useRegisterPlatformAdministrator();

	const form = useAppForm({
		defaultValues: EMPTY,
		...validatedBy(administratorSchema),
		onSubmit: ({ value }) =>
			register.mutate(
				{ body: value },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: () => form.reset(EMPTY),
				},
			),
	});

	return (
		<>
			<TopBar
				title="Administradores da plataforma"
				meta="Equipe Clivo com acesso a este console · não existe cadastro público"
			/>

			<Page>
				<div className="grid grid-cols-[1fr_1fr] items-start gap-4">
					<Panel className="p-5">
						<form
							onSubmit={submitHandler(form)}
							noValidate
							className="flex flex-col gap-5"
						>
							<div className="flex flex-col gap-1">
								<span className="text-[13.5px] font-semibold text-ink">
									Adicionar administrador
								</span>
								<span className="text-[12px] text-muted">
									A pessoa entra com o e-mail e a senha inicial definidos aqui.
								</span>
							</div>

							<form.AppField name="name">
								{(field) => <field.TextField label="Nome" required />}
							</form.AppField>

							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="E-mail"
										type="email"
										inputMode="email"
										required
									/>
								)}
							</form.AppField>

							<form.AppField name="password">
								{(field) => (
									<field.TextField
										label="Senha inicial"
										type="password"
										autoComplete="new-password"
										required
										hint="Mínimo de 8 caracteres. Combine a troca no primeiro acesso."
									/>
								)}
							</form.AppField>

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
