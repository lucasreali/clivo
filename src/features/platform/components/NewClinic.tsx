import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf } from "#/shared/api-error";
import { FormTextField } from "#/shared/form/fields";
import { showViolations } from "#/shared/form/violations";
import { maskTaxId } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicOnboarding } from "../hooks/use-clinics";
import {
	type ClinicDraft,
	clinicSchema,
	EMPTY_CLINIC_DRAFT,
	newClinicRequestOf,
} from "../model/clinic-draft";

export function NewClinic() {
	const navigate = useNavigate();

	const form = useForm<ClinicDraft>({
		resolver: zodResolver(clinicSchema),
		mode: "onTouched",
		defaultValues: EMPTY_CLINIC_DRAFT,
	});

	const onboarding = useClinicOnboarding();

	const submit = form.handleSubmit((values) =>
		onboarding.mutate(
			{ body: newClinicRequestOf(values) },
			{
				onError: (error) => showViolations(error, form.setError),
				onSuccess: (provisioned) =>
					navigate({
						to: "/console/clinicas/$tenantId/modulos",
						params: { tenantId: String(provisioned.clinic?.id) },
					}),
			},
		),
	);

	return (
		<>
			<TopBar title="Nova clínica" meta="Console · Clínicas · cadastro" />

			<Page>
				<form onSubmit={submit} noValidate className="flex flex-col gap-4">
					<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
						<div className="flex flex-col gap-4">
							<Panel>
								<PanelHeader
									title="Parte 1 · Dados da clínica"
									hint="Identificação do inquilino nesta instância."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<FormTextField
										control={form.control}
										name="name"
										label="Nome da clínica"
										required
										hint="Como a clínica aparece nas telas e nos relatórios."
									/>
									<FormTextField
										control={form.control}
										name="legalName"
										label="Razão social"
									/>
									<FormTextField
										control={form.control}
										name="taxId"
										label="CNPJ"
										mask={maskTaxId}
										inputMode="numeric"
										placeholder="00.000.000/0000-00"
										hint="Identifica a clínica na plataforma: um CNPJ pertence a uma única clínica."
									/>
									<FormTextField
										control={form.control}
										name="segment"
										label="Segmento"
										hint="Odontologia, fisioterapia, veterinária… orienta a implantação, não trava a configuração."
									/>
								</div>
							</Panel>

							<Panel>
								<PanelHeader
									title="Parte 2 · Primeiro gestor"
									hint="Sem este usuário a clínica nasce inacessível: ninguém do lado do cliente consegue entrar nem criar outros usuários."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<FormTextField
										control={form.control}
										name="managerName"
										label="Nome"
										required
									/>
									<FormTextField
										control={form.control}
										name="managerEmail"
										label="E-mail"
										type="email"
										inputMode="email"
										required
									/>
									<FormTextField
										control={form.control}
										name="managerPassword"
										label="Senha inicial"
										type="password"
										autoComplete="new-password"
										required
										hint="Mínimo de 8 caracteres. Combine a troca no primeiro acesso."
									/>
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
