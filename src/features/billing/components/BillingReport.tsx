import { useState } from "react";
import { useGetBillingReport } from "#/api/gen/hooks";
import type { BillingReportView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { isNotGranted, messageOf } from "#/shared/api-error";
import { shiftDays, today } from "#/shared/format/date";
import { money } from "#/shared/format/money";
import { Callout } from "#/shared/ui/Callout";
import { EmptyState } from "#/shared/ui/EmptyState";
import { TextInput } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

export function BillingReport() {
	const [from, setFrom] = useState(shiftDays(today(), -30));
	const [to, setTo] = useState(today());

	const report = useGetBillingReport({ query: { from, to } });

	return (
		<>
			<AppTopBar
				title="Financeiro"
				meta="Relatório de faturamento do período"
			/>

			<Page>
				<Panel>
					<PanelHeader
						title="Período"
						actions={
							<div className="flex items-center gap-2">
								<TextInput
									type="date"
									value={from}
									onChange={(event) => setFrom(event.target.value)}
									className="h-[34px] w-[160px]"
									aria-label="Data inicial"
								/>
								<TextInput
									type="date"
									value={to}
									onChange={(event) => setTo(event.target.value)}
									className="h-[34px] w-[160px]"
									aria-label="Data final"
								/>
							</div>
						}
					/>

					<ReportBody error={report.error} data={report.data} />
				</Panel>
			</Page>
		</>
	);
}

type ReportBodyProps = {
	error: unknown;
	data: BillingReportView | undefined;
};

function ReportBody({ error, data }: ReportBodyProps) {
	if (isNotGranted(error)) {
		return <ReportDenied />;
	}

	if (error) {
		return (
			<div className="p-5">
				<Callout tone="danger">{messageOf(error)}</Callout>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-5 gap-3 p-5">
			<Metric label="Cobranças" value={String(data?.invoices ?? 0)} />
			<Metric label="Bruto" value={money(data?.gross)} />
			<Metric label="Descontos" value={money(data?.discount)} />
			<Metric label="Recebido" value={money(data?.received)} />
			<Metric label="Em aberto" value={money(data?.outstanding)} />
		</div>
	);
}

function ReportDenied() {
	return (
		<EmptyState
			title="Relatório restrito ao seu perfil"
			description="Nesta clínica o modelo de acesso reserva os números do faturamento à gestão. Peça a quem gerencia a clínica para liberar o seu perfil."
		/>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-1 rounded-[10px] border border-line bg-surface px-4 py-3">
			<span className="text-[11.5px] text-muted">{label}</span>
			<span className="text-[18px] font-semibold text-ink">{value}</span>
		</div>
	);
}
