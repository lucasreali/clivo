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
			<AppTopBar title="Billing" meta="Revenue report for the period" />

			<Page>
				<Panel>
					<PanelHeader
						title="Period"
						actions={
							<div className="flex items-center gap-2">
								<TextInput
									type="date"
									value={from}
									onChange={(event) => setFrom(event.target.value)}
									className="h-[34px] w-[160px]"
									aria-label="Start date"
								/>
								<TextInput
									type="date"
									value={to}
									onChange={(event) => setTo(event.target.value)}
									className="h-[34px] w-[160px]"
									aria-label="End date"
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
			<Metric label="Invoices" value={String(data?.invoices ?? 0)} />
			<Metric label="Gross" value={money(data?.gross)} />
			<Metric label="Discounts" value={money(data?.discount)} />
			<Metric label="Received" value={money(data?.received)} />
			<Metric label="Outstanding" value={money(data?.outstanding)} />
		</div>
	);
}

function ReportDenied() {
	return (
		<EmptyState
			title="Report restricted for your role"
			description="In this clinic the access model reserves revenue figures for management. Ask whoever manages the clinic to grant your role access."
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
