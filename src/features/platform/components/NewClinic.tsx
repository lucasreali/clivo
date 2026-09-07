import { useNavigate } from "@tanstack/react-router";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { maskTaxId } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicOnboarding } from "../hooks/use-clinics";
import {
	clinicSchema,
	EMPTY_CLINIC_DRAFT,
	newClinicRequestOf,
} from "../model/clinic-draft";

export function NewClinic() {
	const navigate = useNavigate();
	const onboarding = useClinicOnboarding();

	const form = useAppForm({
		defaultValues: EMPTY_CLINIC_DRAFT,
		...validatedBy(clinicSchema),
		onSubmit: ({ value }) =>
			onboarding.mutate(
				{ body: newClinicRequestOf(value) },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: (provisioned) =>
						navigate({
							to: "/console/clinicas/$tenantId/modulos",
							params: { tenantId: String(provisioned.clinic?.id) },
						}),
				},
			),
	});

	return (
		<>
			<TopBar title="Nova clínica" meta="Console · Clínicas · cadastro" />

			<Page>
				<form
					onSubmit={submitHandler(form)}
					noValidate
					className="flex flex-col gap-4"
				>
					<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
						<div className="flex flex-col gap-4">
							<Panel>
								<PanelHeader
									title="Parte 1 · Dados da clínica"
									hint="Identificação do inquilino nesta instância."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<form.AppField name="name">
										{(field) => (
											<field.TextField
												label="Nome da clínica"
												required
												hint="Como a clínica aparece nas telas e nos relatórios."
											/>
										)}
									</form.AppField>
									<form.AppField name="legalName">
										{(field) => <field.TextField label="Razão social" />}
									</form.AppField>
									<form.AppField name="taxId">
										{(field) => (
											<field.TextField
												label="CNPJ"
												mask={maskTaxId}
												inputMode="numeric"
												placeholder="00.000.000/0000-00"
												hint="Identifica a clínica na plataforma: um CNPJ pertence a uma única clínica."
											/>
										)}
									</form.AppField>
									<form.AppField name="segment">
										{(field) => (
											<field.TextField
												label="Segmento"
												hint="Odontologia, fisioterapia, veterinária… orienta a implantação, não trava a configuração."
											/>
										)}
									</form.AppField>
								</div>
							</Panel>

							<Panel>
								<PanelHeader
									title="Parte 2 · Primeiro gestor"
									hint="Sem este usuário a clínica nasce inacessível: ninguém do lado do cliente consegue entrar nem criar outros usuários."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<form.AppField name="managerName">
										{(field) => <field.TextField label="Nome" required />}
									</form.AppField>
									<form.AppField name="managerEmail">
										{(field) => (
											<field.TextField
												label="E-mail"
												type="email"
												inputMode="email"
												required
											/>
										)}
									</form.AppField>
									<form.AppField name="managerPassword">
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
								</div>
							</Panel>
						</div>

						<Panel className="flex flex-col gap-3 p-5">
							<span className="text-[13.5px] font-semibold text-ink">
								Como a clínica nasce
							</span>
							<Callout tone="warn" title="Sem nenhum módulo ativo">
								Só agenda, clientes e atendimentos — o núcleo que toda clínica
								tem. Depois de criar, o próximo passo é configurar os módulos.
							</Callout>
							<p className="m-0 text-[12.5px] leading-relaxed text-muted">
								O gestor recebe o perfil de administrador da clínica: cria
								usuários, define horários e opera todos os módulos ativos. Não
								tem acesso a este console.
							</p>
							<p className="m-0 text-[12px] leading-relaxed text-faint">
								A clínica passa a ser endereçada pelo identificador que a
								plataforma gera. O CNPJ, quando informado, não pode se repetir
								em outra clínica.
							</p>
						</Panel>
					</div>

					{onboarding.isError ? (
						<Callout tone="danger">{messageOf(onboarding.error)}</Callout>
					) : null}

					<div className="flex justify-end gap-2">
						<Button
							variant="secondary"
							onClick={() => navigate({ to: "/console" })}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={onboarding.isPending}>
							{onboarding.isPending ? "Criando…" : "Criar clínica"}
						</Button>
					</div>
				</form>
			</Page>
		</>
	);
}
