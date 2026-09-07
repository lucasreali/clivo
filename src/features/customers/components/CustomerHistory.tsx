import { Link } from "@tanstack/react-router";
import {
	useGetCustomer,
	useListCustomerEncounters,
	useListInvoicesByCustomer,
} from "#/api/gen/hooks";
import { describeInvoiceStatus } from "#/features/billing/model/invoice-status";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { dateTimeLabel } from "#/shared/format/date";
import { money } from "#/shared/format/money";
import { Badge } from "#/shared/ui/Badge";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

type CustomerHistoryProps = {
	customerId: string;
};

export function CustomerHistory({ customerId }: CustomerHistoryProps) {
	const customer = useGetCustomer({ path: { id: customerId } });
	const encounters = useListCustomerEncounters({ query: { customerId } });
	const invoices = useListInvoicesByCustomer({ query: { customerId } });

	const outstanding = (invoices.data ?? []).reduce(
		(total, invoice) => total + (invoice.outstandingBalance ?? 0),
		0,
	);

	return (
		<>
			<TopBar
				title={customer.data?.name ?? "Cliente"}
				meta="Clientes › Histórico de atendimentos"
			/>

			<Page>
				<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
					<Panel>
						<PanelHeader
							title="Atendimentos"
							hint={`${(encounters.data ?? []).length} registros`}
						/>

						{(encounters.data ?? []).length === 0 ? (
							<EmptyState
								title="Nenhum atendimento registrado"
								description="Os atendimentos aparecem aqui assim que a ficha é aberta na recepção."
							/>
						) : null}

						{(encounters.data ?? []).map((encounter) => (
							<article
								key={encounter.id}
								className="flex items-start gap-4 border-b border-line px-4 py-3.5 last:border-b-0"
							>
								<span className="w-[130px] shrink-0 text-[12.5px] text-muted">
									{dateTimeLabel(encounter.startedAt)}
								</span>
								<div className="flex min-w-0 flex-1 flex-col gap-1">
									<span className="text-[13.5px] font-medium text-ink">
										{encounter.serviceName ?? "Atendimento"}
									</span>
									<span className="text-[12px] text-muted">
										{encounter.practitionerName ?? "—"}
									</span>
									<span className="text-[12px] text-faint">
										Ficha: {encounter.sheet?.templateName ?? "—"} · versão{" "}
										{encounter.sheet?.templateVersion ?? "—"}
									</span>
								</div>
								<Badge
									tone={encounter.status === "COMPLETED" ? "neutral" : "brand"}
								>
									{encounter.status === "COMPLETED" ? "Concluído" : "Em aberto"}
								</Badge>
							</article>
						))}
					</Panel>

					<Panel>
						<PanelHeader
							title="Cobranças"
							hint={`Em aberto: ${money(outstanding)}`}
						/>

						{(invoices.data ?? []).length === 0 ? (
							<EmptyState
								title="Nenhuma cobrança"
								description="As cobranças são geradas ao concluir um atendimento."
							/>
						) : null}

						{(invoices.data ?? []).map((invoice) => {
							const status = describeInvoiceStatus(invoice.status);

							return (
								<Link
									key={invoice.id}
									to="/financeiro/$invoiceId"
									params={{ invoiceId: String(invoice.id) }}
									className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] last:border-b-0 hover:bg-surface"
								>
									<span className="flex flex-col">
										<span className="font-medium text-ink">
											Cobrança #{invoice.id}
										</span>
										<span className="text-[11.5px] text-muted">
											Vence em {invoice.dueDate ?? "—"}
										</span>
									</span>
									<span className="flex items-center gap-3">
										<span className="font-semibold text-ink">
											{money(invoice.netAmount)}
										</span>
										<Badge tone={status.tone}>{status.label}</Badge>
									</span>
								</Link>
							);
						})}
					</Panel>
				</div>
			</Page>
		</>
	);
}
