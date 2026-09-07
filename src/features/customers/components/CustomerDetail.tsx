import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDescribeCustomer, useGetCustomer } from "#/api/gen/hooks";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { messageOf } from "#/shared/api-error";
import { showViolations } from "#/shared/form/violations";
import { Badge } from "#/shared/ui/Badge";
import { Button, buttonClass } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel } from "#/shared/ui/Panel";
import {
	type CustomerDraft,
	customerSchema,
	draftOf,
	EMPTY_DRAFT,
	requestOf,
} from "../model/customer-draft";
import { describeCustomerStatus } from "../model/customer-status";
import { CustomerFields } from "./CustomerFields";
import { DeactivateCustomerDialog } from "./DeactivateCustomerDialog";
import { DependentsPanel } from "./DependentsPanel";
import { InsurancePanel } from "./InsurancePanel";

type CustomerDetailProps = {
	customerId: string;
};

export function CustomerDetail({ customerId }: CustomerDetailProps) {
	const [deactivating, setDeactivating] = useState(false);
	const queryClient = useQueryClient();

	const customer = useGetCustomer({ path: { id: customerId } });
	const form = useForm<CustomerDraft>({
		resolver: zodResolver(customerSchema),
		mode: "onTouched",
		defaultValues: EMPTY_DRAFT,
	});

	const describe = useDescribeCustomer({
		mutation: {
			onError: (error) => showViolations(error, form.setError),
			onSuccess: () => queryClient.invalidateQueries(),
		},
	});

	const { reset } = form;
	useEffect(() => {
		if (customer.data) {
			reset(draftOf(customer.data));
		}
	}, [customer.data, reset]);

	const save = form.handleSubmit((values) =>
		describe.mutate({ path: { id: customerId }, body: requestOf(values) }),
	);

	if (!customer.data) {
		return <Page>Carregando cadastro…</Page>;
	}

	const situation = describeCustomerStatus(customer.data.status);

	return (
		<>
			<AppTopBar
				title={customer.data.name ?? "Cliente"}
				meta="Clientes › Cadastro"
				actions={
					<Link
						to="/clientes/$customerId/historico"
						params={{ customerId: String(customerId) }}
						className={buttonClass("secondary")}
					>
						Ver histórico
					</Link>
				}
			/>

			<Page>
				<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
					<form onSubmit={save} noValidate className="flex flex-col gap-4">
						<Panel className="p-5">
							<div className="mb-5 flex items-center justify-between">
								<Badge tone={situation.tone}>{situation.label}</Badge>
								<Button
									variant="ghost"
									onClick={() => setDeactivating(true)}
									disabled={customer.data.status === "INACTIVE"}
								>
									Inativar cliente
								</Button>
							</div>

							<CustomerFields control={form.control} lockNationalId />
						</Panel>

						{describe.isError ? (
							<Callout tone="danger">{messageOf(describe.error)}</Callout>
						) : null}

						{describe.isSuccess ? (
							<Callout tone="brand">Cadastro atualizado.</Callout>
						) : null}

						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => reset(draftOf(customer.data))}
							>
								Descartar
							</Button>
							<Button type="submit" disabled={describe.isPending}>
								Salvar alterações
							</Button>
						</div>
					</form>

					<div className="flex flex-col gap-4">
						<ModuleGate requires={MODULE.insurance}>
							<InsurancePanel customerId={customerId} />
						</ModuleGate>
						<ModuleGate requires={MODULE.dependents}>
							<DependentsPanel customerId={customerId} />
						</ModuleGate>
					</div>
				</div>
			</Page>

			{deactivating ? (
				<DeactivateCustomerDialog
					customer={customer.data}
					onClose={() => setDeactivating(false)}
				/>
			) : null}
		</>
	);
}
