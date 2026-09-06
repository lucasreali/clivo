import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useRecordCustomerConsent, useRegisterCustomer } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf, violationsOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Checkbox } from "#/shared/ui/Field";
import { Panel } from "#/shared/ui/Panel";
import {
	type CustomerDraft,
	EMPTY_DRAFT,
	requestOf,
} from "../model/customer-draft";
import { CustomerFields } from "./CustomerFields";

const CONSENT_PURPOSE = "Prontuário, agendamento e cobrança";
const CONSENT_SOURCE = "RECEPTION";

export function NewCustomer() {
	const [draft, setDraft] = useState<CustomerDraft>(EMPTY_DRAFT);
	const [consented, setConsented] = useState(false);
	const navigate = useNavigate();
	const consent = useRecordCustomerConsent();

	const register = useRegisterCustomer({
		mutation: {
			onSuccess: async (customer) => {
				await grantConsent(customer.id as number);
				await navigate({
					to: "/clientes/$customerId",
					params: { customerId: String(customer.id) },
				});
			},
		},
	});

	async function grantConsent(customerId: number) {
		if (!consented) {
			return;
		}

		await consent.mutateAsync({
			path: { id: customerId },
			body: {
				granted: true,
				purpose: CONSENT_PURPOSE,
				source: CONSENT_SOURCE,
			},
		});
	}

	function submit(event: React.FormEvent) {
		event.preventDefault();
		register.mutate({ body: requestOf(draft) });
	}

	return (
		<>
			<TopBar title="Novo cliente" meta="Clientes › Cadastro" />

			<Page>
				<form onSubmit={submit} className="flex flex-col gap-4">
					<Panel className="p-5">
						<CustomerFields
							draft={draft}
							errors={violationsOf(register.error)}
							onChange={(patch) => setDraft({ ...draft, ...patch })}
						/>
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
