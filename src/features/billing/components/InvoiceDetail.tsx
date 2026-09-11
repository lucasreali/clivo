import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	useApplyInvoiceDiscount,
	useGetInvoice,
	useSettleInvoice,
} from "#/api/gen/hooks";
import type {
	LineView,
	PaymentRequestMethodEnumKey,
	PaymentView,
} from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { messageOf } from "#/shared/api-error";
import { dateTimeLabel } from "#/shared/format/date";
import { money } from "#/shared/format/money";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Field, TextInput } from "#/shared/ui/Field";
import { NumberInput } from "#/shared/ui/NumberInput";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { Select } from "#/shared/ui/Select";
import { describeInvoiceStatus } from "../model/invoice-status";

const METHODS: { value: PaymentRequestMethodEnumKey; label: string }[] = [
	{ value: "PIX", label: "Pix" },
	{ value: "CASH", label: "Cash" },
	{ value: "DEBIT", label: "Debit card" },
	{ value: "CREDIT", label: "Credit card" },
	{ value: "INSURANCE", label: "Insurance" },
];

const lineColumn = columnsFor<LineView>();

const LINE_COLUMNS = lineColumn.columns([
	lineColumn.accessor("description", { header: "Description" }),
	lineColumn.accessor("quantity", {
		header: "Qty.",
		meta: { width: "80px" },
		cell: ({ getValue }) => (
			<span className="text-muted">{getValue() ?? 1}</span>
		),
	}),
	lineColumn.accessor("unitPrice", {
		header: "Unit price",
		meta: { width: "22%" },
		cell: ({ getValue }) => (
			<span className="text-muted">{money(getValue())}</span>
		),
	}),
	lineColumn.accessor((line) => (line.unitPrice ?? 0) * (line.quantity ?? 1), {
		id: "total",
		header: "Total",
		meta: { width: "22%", align: "right" },
		cell: ({ getValue }) => (
			<span className="font-medium text-ink">{money(getValue())}</span>
		),
	}),
]);

const paymentColumn = columnsFor<PaymentView>();

const PAYMENT_COLUMNS = paymentColumn.columns([
	paymentColumn.accessor("method", { header: "Method" }),
	paymentColumn.accessor("paidAt", {
		header: "Received on",
		meta: { width: "45%" },
		cell: ({ getValue }) => (
			<span className="text-[12px] text-muted">
				{dateTimeLabel(getValue())}
			</span>
		),
	}),
	paymentColumn.accessor("amount", {
		header: "Amount",
		meta: { width: "120px", align: "right" },
		cell: ({ row }) => (
			<span className="font-medium text-ink">
				{money(row.original.amount)}
				{row.original.refunded ? " · refunded" : ""}
			</span>
		),
	}),
]);

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
		return <Page>Loading invoice…</Page>;
	}

	const status = describeInvoiceStatus(invoice.data.status);

	return (
		<>
			<AppTopBar
				title={`Invoice #${invoiceId}`}
				meta={`Billing · ${invoice.data.customerName ?? ""}`}
			/>

			<Page>
				<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
					<div className="flex flex-col gap-4">
						<Panel>
							<PanelHeader
								title="Encounter items"
								actions={<Badge tone={status.tone}>{status.label}</Badge>}
							/>

							<DataTable
								columns={LINE_COLUMNS}
								rows={invoice.data.lines ?? []}
								rowId={(line) => `${line.serviceId}-${line.description}`}
								empty={
									<EmptyState
										title="No items posted"
										description="The encounter items show up here as soon as the record is completed."
									/>
								}
							/>

							<dl className="m-0 flex flex-col gap-1.5 border-t border-line bg-surface px-4 py-3 text-[13px]">
								<Total label="Subtotal" value={invoice.data.grossAmount} />
								<Total label="Discount" value={-(invoice.data.discount ?? 0)} />
								<Total label="Total" value={invoice.data.netAmount} strong />
								<Total
									label="Outstanding"
									value={invoice.data.outstandingBalance}
									strong
								/>
							</dl>
						</Panel>

						{invoice.data.coverage ? (
							<Callout tone="neutral">{invoice.data.coverage}</Callout>
						) : null}

						<Panel>
							<PanelHeader title="Recorded payments" />
							<DataTable
								columns={PAYMENT_COLUMNS}
								rows={invoice.data.payments ?? []}
								rowId={(payment) => String(payment.id)}
								empty={
									<EmptyState
										title="No payments recorded"
										description="Payments show up here as soon as one is posted."
									/>
								}
							/>
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
			<PanelHeader title="Record a payment" />
			<form onSubmit={submit} className="flex flex-col gap-3 p-4">
				<Field label="Payment method" required>
					{(id) => (
						<Select
							id={id}
							value={method}
							onChange={(chosen) =>
								setMethod(chosen as PaymentRequestMethodEnumKey)
							}
							options={METHODS}
						/>
					)}
				</Field>
				<Field label="Amount received" required>
					{(id) => (
						<NumberInput
							id={id}
							min={0}
							step={0.01}
							value={amount}
							onChange={setAmount}
						/>
					)}
				</Field>
				{error ? <Callout tone="danger">{error}</Callout> : null}
				<Button type="submit" disabled={isPending}>
					Record payment
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
			<PanelHeader title="Authorized discount" />
			<form onSubmit={submit} className="flex flex-col gap-3 p-4">
				<Field label="Discount amount" required>
					{(id) => (
						<NumberInput
							id={id}
							min={0}
							step={0.01}
							value={amount}
							onChange={setAmount}
						/>
					)}
				</Field>
				<Field label="Reason">
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
					Apply discount
				</Button>
			</form>
		</Panel>
	);
}
