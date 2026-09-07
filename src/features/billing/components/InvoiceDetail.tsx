import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	useApplyInvoiceDiscount,
	useGetInvoice,
	useSettleInvoice,
} from "#/api/gen/hooks";
import type { PaymentRequestMethodEnumKey } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { messageOf } from "#/shared/api-error";
import { dateTimeLabel } from "#/shared/format/date";
import { money } from "#/shared/format/money";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, Select, TextInput } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { describeInvoiceStatus } from "../model/invoice-status";

const METHODS: { value: PaymentRequestMethodEnumKey; label: string }[] = [
	{ value: "PIX", label: "Pix" },
	{ value: "CASH", label: "Dinheiro" },
	{ value: "DEBIT", label: "Cartão de débito" },
	{ value: "CREDIT", label: "Cartão de crédito" },
	{ value: "INSURANCE", label: "Convênio" },
];

type InvoiceDetailProps = {
	invoiceId: string;
};

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
	const queryClient = useQueryClient();
	const invoice = useGetInvoice({ path: { id: invoiceId } });

	const refresh = () => queryClient.invalidateQueries();
	const settle = useSettleInvoice({ mutation: { onSuccess: refresh } });
	const discount = useApplyInvoiceDiscount({
		mutation: { onSuccess: refresh },
	});

	if (!invoice.data) {
		return <Page>Carregando cobrança…</Page>;
	}

	const status = describeInvoiceStatus(invoice.data.status);

	return (
		<>
			<AppTopBar
				title={`Cobrança #${invoiceId}`}
				meta={`Financeiro · ${invoice.data.customerName ?? ""}`}
			/>

			<Page>
				<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
					<div className="flex flex-col gap-4">
						<Panel>
							<PanelHeader
								title="Itens do atendimento"
								actions={<Badge tone={status.tone}>{status.label}</Badge>}
							/>

							<div className="grid grid-cols-[2.4fr_80px_1fr_1fr] gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase">
								<span>Descrição</span>
								<span>Qtd.</span>
								<span>Valor unitário</span>
								<span className="text-right">Total</span>
							</div>

							{(invoice.data.lines ?? []).map((line) => (
								<div
									key={`${line.serviceId}-${line.description}`}
									className="grid grid-cols-[2.4fr_80px_1fr_1fr] gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0"
								>
									<span className="text-ink">{line.description}</span>
									<span className="text-muted">{line.quantity ?? 1}</span>
									<span className="text-muted">{money(line.unitPrice)}</span>
									<span className="text-right font-medium text-ink">
										{money((line.unitPrice ?? 0) * (line.quantity ?? 1))}
									</span>
								</div>
							))}

							<dl className="m-0 flex flex-col gap-1.5 border-t border-line bg-surface px-4 py-3 text-[13px]">
								<Total label="Subtotal" value={invoice.data.grossAmount} />
								<Total label="Desconto" value={-(invoice.data.discount ?? 0)} />
								<Total label="Total" value={invoice.data.netAmount} strong />
								<Total
									label="Em aberto"
									value={invoice.data.outstandingBalance}
									strong
								/>
							</dl>
						</Panel>

						{invoice.data.coverage ? (
							<Callout tone="neutral">{invoice.data.coverage}</Callout>
						) : null}

						<Panel>
							<PanelHeader title="Pagamentos registrados" />
							{(invoice.data.payments ?? []).length === 0 ? (
								<p className="m-0 px-4 py-6 text-center text-[12.5px] text-muted">
									Nenhum recebimento registrado.
								</p>
							) : null}
							{(invoice.data.payments ?? []).map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] last:border-b-0"
								>
									<span className="text-ink">{payment.method}</span>
									<span className="text-[12px] text-muted">
										{dateTimeLabel(payment.paidAt)}
									</span>
									<span className="font-medium text-ink">
										{money(payment.amount)}
										{payment.refunded ? " · estornado" : ""}
									</span>
								</div>
							))}
						</Panel>
					</div>

					<div className="flex flex-col gap-4">
						<SettleForm
							outstanding={invoice.data.outstandingBalance ?? 0}
							onSettle={(body) =>
								settle.mutate({ path: { id: invoiceId }, body })
							}
							isPending={settle.isPending}
							error={settle.isError ? messageOf(settle.error) : undefined}
						/>
						<DiscountForm
							onApply={(body) =>
								discount.mutate({ path: { id: invoiceId }, body })
							}
							isPending={discount.isPending}
							error={discount.isError ? messageOf(discount.error) : undefined}
						/>
					</div>
				</div>
			</Page>
		</>
	);
}

function Total({
	label,
	value,
	strong = false,
}: {
	label: string;
	value: number | undefined;
	strong?: boolean;
}) {
	return (
		<div className="flex justify-between">
			<dt className={strong ? "font-semibold text-ink" : "text-muted"}>
				{label}
			</dt>
			<dd className={`m-0 ${strong ? "font-semibold text-ink" : "text-muted"}`}>
				{money(value)}
			</dd>
		</div>
	);
}

type SettleFormProps = {
	outstanding: number;
	onSettle: (body: {
		amount: number;
		method: PaymentRequestMethodEnumKey;
	}) => void;
	isPending: boolean;
	error?: string;
};

function SettleForm({
	outstanding,
	onSettle,
	isPending,
	error,
}: SettleFormProps) {
	const [amount, setAmount] = useState(String(outstanding));
	const [method, setMethod] = useState<PaymentRequestMethodEnumKey>("PIX");

	function submit(event: React.FormEvent) {
		event.preventDefault();
		onSettle({ amount: Number(amount), method });
	}

	return (
		<Panel>
			<PanelHeader title="Registrar recebimento" />
			<form onSubmit={submit} className="flex flex-col gap-3 p-4">
				<Field label="Forma de pagamento" required>
					{(id) => (
						<Select
							id={id}
							value={method}
							onChange={(event) =>
								setMethod(event.target.value as PaymentRequestMethodEnumKey)
							}
						>
							{METHODS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
					)}
				</Field>
				<Field label="Valor recebido" required>
					{(id) => (
						<TextInput
							id={id}
							type="number"
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
						/>
					)}
				</Field>
				{error ? <Callout tone="danger">{error}</Callout> : null}
				<Button type="submit" disabled={isPending}>
					Registrar recebimento
				</Button>
			</form>
		</Panel>
	);
}

type DiscountFormProps = {
	onApply: (body: { amount: number; reason?: string }) => void;
	isPending: boolean;
	error?: string;
};

function DiscountForm({ onApply, isPending, error }: DiscountFormProps) {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");

	function submit(event: React.FormEvent) {
		event.preventDefault();
		onApply({ amount: Number(amount), reason: reason || undefined });
	}

	return (
		<Panel>
			<PanelHeader title="Desconto autorizado" />
			<form onSubmit={submit} className="flex flex-col gap-3 p-4">
				<Field label="Valor do desconto" required>
					{(id) => (
						<TextInput
							id={id}
							type="number"
							step="0.01"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
						/>
					)}
				</Field>
				<Field label="Motivo">
					{(id) => (
						<TextInput
							id={id}
							value={reason}
							onChange={(event) => setReason(event.target.value)}
						/>
					)}
				</Field>
				{error ? <Callout tone="danger">{error}</Callout> : null}
				<Button
					variant="secondary"
					type="submit"
					disabled={!amount || isPending}
				>
					Aplicar desconto
				</Button>
			</form>
		</Panel>
	);
}
