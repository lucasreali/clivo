import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf, violationsOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextInput } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicOnboarding } from "../hooks/use-clinics";
import {
	type ClinicDraft,
	EMPTY_CLINIC_DRAFT,
	isReadyToOpen,
	newClinicRequestOf,
} from "../model/clinic-draft";

export function NewClinic() {
	const [draft, setDraft] = useState<ClinicDraft>(EMPTY_CLINIC_DRAFT);
	const navigate = useNavigate();
	const onboarding = useClinicOnboarding();

	const errors = violationsOf(onboarding.error);
	const patch = (change: Partial<ClinicDraft>) =>
		setDraft({ ...draft, ...change });

	function submit(event: React.FormEvent) {
		event.preventDefault();
		onboarding.mutate(
			{ body: newClinicRequestOf(draft) },
			{
				onSuccess: (provisioned) =>
					navigate({
						to: "/console/clinicas/$tenantId/modulos",
						params: { tenantId: String(provisioned.clinic?.id) },
					}),
			},
		);
	}

	return (
		<>
			<TopBar title="Nova clínica" meta="Console · Clínicas · cadastro" />

			<Page>
				<form onSubmit={submit} className="flex flex-col gap-4">
					<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
						<div className="flex flex-col gap-4">
							<Panel>
								<PanelHeader
									title="Parte 1 · Dados da clínica"
									hint="Identificação do inquilino nesta instância."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<Field
										label="Nome da clínica"
										required
										error={errors.name}
										hint="Como a clínica aparece nas telas e nos relatórios."
									>
										{(id) => (
											<TextInput
												id={id}
												value={draft.name}
												onChange={(event) =>
													patch({ name: event.target.value })
												}
												required
											/>
										)}
									</Field>

									<Field
										label="Código único"
										required
										error={errors.code}
										hint="Usado em URLs, exportações e chamados de suporte. Letras e números, sem acento. Não poderá ser alterado depois."
									>
										{(id) => (
											<TextInput
												id={id}
												value={draft.code}
												onChange={(event) =>
													patch({ code: event.target.value.toUpperCase() })
												}
												maxLength={20}
												required
											/>
										)}
									</Field>

									<Field label="Razão social" error={errors.legalName}>
										{(id) => (
											<TextInput
												id={id}
												value={draft.legalName}
												onChange={(event) =>
													patch({ legalName: event.target.value })
												}
											/>
										)}
									</Field>

									<Field
										label="CNPJ"
										error={errors.taxId}
										hint="Somente os 14 dígitos; a pontuação é descartada."
									>
										{(id) => (
											<TextInput
												id={id}
												value={draft.taxId}
												onChange={(event) =>
													patch({ taxId: event.target.value })
												}
											/>
										)}
									</Field>

									<Field
										label="Segmento"
										error={errors.segment}
										hint="Odontologia, fisioterapia, veterinária… orienta a implantação, não trava a configuração."
									>
										{(id) => (
											<TextInput
												id={id}
												value={draft.segment}
												onChange={(event) =>
													patch({ segment: event.target.value })
												}
											/>
										)}
									</Field>
								</div>
							</Panel>

							<Panel>
								<PanelHeader
									title="Parte 2 · Primeiro gestor"
									hint="Sem este usuário a clínica nasce inacessível: ninguém do lado do cliente consegue entrar nem criar outros usuários."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<Field label="Nome" required error={errors.managerName}>
										{(id) => (
											<TextInput
												id={id}
												value={draft.managerName}
												onChange={(event) =>
													patch({ managerName: event.target.value })
												}
												required
											/>
										)}
									</Field>

									<Field label="E-mail" required error={errors.managerEmail}>
										{(id) => (
											<TextInput
												id={id}
												type="email"
												value={draft.managerEmail}
												onChange={(event) =>
													patch({ managerEmail: event.target.value })
												}
												required
											/>
										)}
									</Field>

									<Field
										label="Senha inicial"
										required
										error={errors.managerPassword}
										hint="Mínimo de 8 caracteres. Combine a troca no primeiro acesso."
									>
										{(id) => (
											<TextInput
												id={id}
												type="password"
												autoComplete="new-password"
												value={draft.managerPassword}
												onChange={(event) =>
													patch({ managerPassword: event.target.value })
												}
												minLength={8}
												required
											/>
										)}
									</Field>
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
								O código é imutável após a criação. Para trocá-lo é preciso
								criar outra clínica.
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
						<Button
							type="submit"
							disabled={onboarding.isPending || !isReadyToOpen(draft)}
						>
							{onboarding.isPending ? "Criando…" : "Criar clínica"}
						</Button>
					</div>
				</form>
			</Page>
		</>
	);
}
