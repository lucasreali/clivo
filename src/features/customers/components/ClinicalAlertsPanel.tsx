import { useState } from "react";
import {
	useListClinicalAlerts,
	useRecordClinicalAlert,
	useRewriteClinicalAlert,
	useWithdrawClinicalAlert,
} from "#/api/gen/hooks";
import type { AlertView } from "#/api/gen/types";
import { useRefresh } from "#/api/use-refresh";
import { messageOf, statusOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { dateTimeLabel } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import {
	ALERT_MAX,
	alertDraftOf,
	alertRequestOf,
	alertSchema,
} from "../model/alert-draft";

/**
 * The encounter header repeats the customer's alerts, so a change to them drops
 * the encounter it shows as well.
 */
const ALERT_URLS = ["/api/clinical-alerts", "/api/encounters"];

type ClinicalAlertsPanelProps = {
	customerId: string;
};

/**
 * Standing warnings a practitioner keeps on a customer — an allergy, a
 * condition that changes how they are treated.
 *
 * Who may read them is not decided here: the clinic's `role_model` parameter
 * picks the API's role access strategy, and a role outside the clinical record
 * is answered 403. The panel takes that answer and stays out of the way, so the
 * same screen serves a clinic where reception sees the record and one where it
 * does not.
 */
export function ClinicalAlertsPanel({ customerId }: ClinicalAlertsPanelProps) {
	const [editing, setEditing] = useState<string | undefined>();
	const [withdrawing, setWithdrawing] = useState<AlertView | undefined>();

	const alerts = useListClinicalAlerts({ query: { customerId } });

	if (statusOf(alerts.error) === 403) {
		return null;
	}

	const items = alerts.data ?? [];

	return (
		<Panel>
			<PanelHeader
				title="Alertas clínicos"
				hint="Aparecem no topo de todo atendimento deste cliente."
			/>

			{alerts.isPending ? (
				<p className="m-0 px-4 py-3 text-[12.5px] text-muted">
					Carregando alertas…
				</p>
			) : null}

			{!alerts.isPending && items.length === 0 ? (
				<p className="m-0 px-4 py-3 text-[12.5px] text-muted">
					Nenhum alerta registrado.
				</p>
			) : null}

			<ul className="m-0 list-none p-0">
				{items.map((alert) =>
					alert.id === editing ? (
						<li key={alert.id} className="border-b border-line px-4 py-3">
							<AlertEditor alert={alert} onDone={() => setEditing(undefined)} />
						</li>
					) : (
						<AlertItem
							key={alert.id}
							alert={alert}
							onEdit={() => setEditing(alert.id)}
							onWithdraw={() => setWithdrawing(alert)}
						/>
					),
				)}
			</ul>

			<NewAlert customerId={customerId} />

			{withdrawing ? (
				<WithdrawAlertDialog
					alert={withdrawing}
					onClose={() => setWithdrawing(undefined)}
				/>
			) : null}
		</Panel>
	);
}

type AlertItemProps = {
	alert: AlertView;
	onEdit: () => void;
	onWithdraw: () => void;
};

function AlertItem({ alert, onEdit, onWithdraw }: AlertItemProps) {
	return (
		<li className="flex flex-col gap-1.5 border-b border-line px-4 py-3 last:border-b-0">
			<span className="text-[13px] leading-relaxed text-ink">{alert.note}</span>
			<div className="flex items-center justify-between gap-3">
				<span className="text-[11.5px] text-faint">
					{alert.authorName ?? "—"} · {dateTimeLabel(alert.recordedAt)}
				</span>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={onEdit}
						className="text-[12px] text-brand hover:text-brand-ink"
					>
						Editar
					</button>
					<button
						type="button"
						onClick={onWithdraw}
						className="text-[12px] text-danger hover:text-danger-ink"
					>
						Retirar
					</button>
				</div>
			</div>
		</li>
	);
}

function NewAlert({ customerId }: { customerId: string }) {
	const refresh = useRefresh(ALERT_URLS);
	const record = useRecordClinicalAlert();

	const form = useAppForm({
		defaultValues: alertDraftOf(),
		...validatedBy(alertSchema),
		onSubmit: ({ value }) =>
			record.mutate(
				{ query: { customerId }, body: alertRequestOf(value) },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: async () => {
						form.reset(alertDraftOf());
						await refresh();
					},
				},
			),
	});

	return (
		<form
			onSubmit={submitHandler(form)}
			noValidate
			className="flex flex-col gap-2.5 border-t border-line bg-surface px-4 py-3"
		>
			<form.AppField name="note">
				{(field) => (
					<field.TextAreaField
						label="Novo alerta"
						maxLength={ALERT_MAX}
						placeholder="Alergia a dipirona, hipertenso, não tolera anestesia com vasoconstritor…"
					/>
				)}
			</form.AppField>

			{record.isError ? (
				<Callout tone="danger">{messageOf(record.error)}</Callout>
			) : null}

			<div className="flex justify-end">
				<Button type="submit" disabled={record.isPending}>
					Registrar alerta
				</Button>
			</div>
		</form>
	);
}

type AlertEditorProps = {
	alert: AlertView;
	onDone: () => void;
};

/** Rewriting an alert signs it again: the API records who wrote it and when. */
function AlertEditor({ alert, onDone }: AlertEditorProps) {
	const refresh = useRefresh(ALERT_URLS);
	const rewrite = useRewriteClinicalAlert();

	const form = useAppForm({
		defaultValues: alertDraftOf(alert.note),
		...validatedBy(alertSchema),
		onSubmit: ({ value }) =>
			rewrite.mutate(
				{ path: { id: alert.id as string }, body: alertRequestOf(value) },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: async () => {
						await refresh();
						onDone();
					},
				},
			),
	});

	return (
		<form
			onSubmit={submitHandler(form)}
			noValidate
			className="flex flex-col gap-2.5"
		>
			<form.AppField name="note">
				{(field) => (
					<field.TextAreaField
						label="Alerta"
						required
						maxLength={ALERT_MAX}
						hint="Ao salvar, o alerta passa a constar em seu nome."
					/>
				)}
			</form.AppField>

			{rewrite.isError ? (
				<Callout tone="danger">{messageOf(rewrite.error)}</Callout>
			) : null}

			<div className="flex justify-end gap-2">
				<Button variant="secondary" onClick={onDone}>
					Cancelar
				</Button>
				<Button type="submit" disabled={rewrite.isPending}>
					Salvar alerta
				</Button>
			</div>
		</form>
	);
}

type WithdrawAlertDialogProps = {
	alert: AlertView;
	onClose: () => void;
};

function WithdrawAlertDialog({ alert, onClose }: WithdrawAlertDialogProps) {
	const refresh = useRefresh(ALERT_URLS);

	const withdraw = useWithdrawClinicalAlert({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	return (
		<Modal
			title="Retirar este alerta?"
			dismissal="guarded"
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Voltar
					</Button>
					<Button
						variant="danger"
						onClick={() =>
							withdraw.mutate({ path: { id: alert.id as string } })
						}
						disabled={withdraw.isPending}
					>
						Retirar alerta
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				“{alert.note}” deixa de aparecer na ficha e nos próximos atendimentos.
				Retire apenas o que não vale mais para este cliente.
			</Callout>

			{withdraw.isError ? (
				<Callout tone="danger">{messageOf(withdraw.error)}</Callout>
			) : null}
		</Modal>
	);
}
