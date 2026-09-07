import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRecordCustomerConsent, useRegisterCustomer } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { messageOf } from "#/shared/api-error";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Checkbox } from "#/shared/ui/Field";
import { Panel } from "#/shared/ui/Panel";
import {
	type CustomerDraft,
	customerSchema,
	EMPTY_DRAFT,
	requestOf,
} from "../model/customer-draft";
import { CustomerFields } from "./CustomerFields";

const CONSENT_PURPOSE = "Prontuário, agendamento e cobrança";
const CONSENT_SOURCE = "RECEPTION";

export function NewCustomer() {
	const [consented, setConsented] = useState(false);
	const navigate = useNavigate();
	const consent = useRecordCustomerConsent();

	const form = useForm<CustomerDraft>({
		resolver: zodResolver(customerSchema),
		mode: "onTouched",
		defaultValues: EMPTY_DRAFT,
	});

	const register = useRegisterCustomer({
		mutation: { onError: (error) => showViolations(error, form.setError) },
	});

	async function grantConsent(customerId: string) {
		await consent.mutateAsync({
			path: { id: customerId },
			body: {
				granted: true,
				purpose: CONSENT_PURPOSE,
				source: CONSENT_SOURCE,
			},
		});
	}

	const submit = form.handleSubmit((values) =>
		register.mutate(
			{ body: requestOf(values) },
			{
				onSuccess: async (customer) => {
					const customerId = customer.id as string;
					if (consented) {
						await grantConsent(customerId);
					}
					await navigate({
						to: "/clientes/$customerId",
						params: { customerId },
					});
				},
			},
		),
	);

	return (
		<>
			<AppTopBar title="Novo cliente" meta="Clientes › Cadastro" />

			<Page>
				<form onSubmit={submit} noValidate className="flex flex-col gap-4">
					<Panel className="p-5">
						<CustomerFields control={form.control} />
					</Panel>

					<Panel className="flex flex-col gap-3 p-5">
						<span className="text-[13.5px] font-semibold text-ink">
							Consentimento LGPD
						</span>
						<p className="m-0 text-[12.5px] leading-relaxed text-muted">
							A clínica trata dados pessoais e de saúde para prontuário,
							agendamento, cobrança e obrigações legais. O cliente pode
							solicitar acesso, correção ou exclusão a qualquer momento.
						</p>
						<Checkbox
							checked={consented}
							onChange={(event) => setConsented(event.target.checked)}
							label="O cliente leu e concordou com o termo de tratamento de dados, assinado presencialmente na recepção."
						/>
					</Panel>

					{register.isError ? (
						<Callout tone="danger">{messageOf(register.error)}</Callout>
					) : null}

					<div className="flex justify-end gap-2">
						<Button
							variant="secondary"
							onClick={() => navigate({ to: "/clientes" })}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={register.isPending}>
							Salvar cliente
						</Button>
					</div>
				</form>
			</Page>
		</>
	);
}
