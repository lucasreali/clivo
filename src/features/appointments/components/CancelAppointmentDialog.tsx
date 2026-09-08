import { useState } from "react";
import type { AppointmentView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { clockTime, shortDate } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextArea } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";
import { Select } from "#/shared/ui/Select";
import { useAppointmentActions } from "../hooks/use-appointment-actions";

const REASONS = [
	"Solicitação do paciente",
	"Indisponibilidade do profissional",
	"Reagendamento acordado",
	"Paciente não confirmou",
	"Outro motivo",
];

type CancelAppointmentDialogProps = {
	appointment: AppointmentView;
	onClose: () => void;
};

export function CancelAppointmentDialog({
	appointment,
	onClose,
}: CancelAppointmentDialogProps) {
	const [reason, setReason] = useState(REASONS[0]);
	const [note, setNote] = useState("");
	const { cancel } = useAppointmentActions();

	function confirm() {
		cancel.mutate(
			{
				path: { id: appointment.id as string },
				body: { reason: note ? `${reason} — ${note}` : reason },
			},
			{ onSuccess: onClose },
		);
	}

	return (
		<Modal
			title={`Cancelar agendamento de ${appointment.customerName ?? "cliente"}?`}
			dismissal="guarded"
			subtitle={`${appointment.serviceName ?? "Atendimento"} · ${appointment.practitionerName ?? ""} · ${shortDate(appointment.start)} às ${clockTime(appointment.start)}`}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Voltar sem cancelar
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={cancel.isPending}
					>
						Confirmar cancelamento
					</Button>
				</>
			}
		>
			<Field label="Motivo do cancelamento" required>
				{(id) => (
					<Select
						id={id}
						value={reason}
						onChange={setReason}
						options={REASONS.map((option) => ({
							value: option,
							label: option,
						}))}
					/>
				)}
			</Field>

			<Field label="Observação (opcional)">
				{(id) => (
					<TextArea
						id={id}
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="Ex.: paciente avisou com 2 horas de antecedência."
					/>
				)}
			</Field>

			<Callout tone="neutral">
				O agendamento não é excluído: fica registrado como cancelado no
				histórico do cliente, com o motivo e quem cancelou. O horário volta a
				ficar livre na agenda.
			</Callout>

			{cancel.isError ? (
				<Callout tone="danger">{messageOf(cancel.error)}</Callout>
			) : null}
		</Modal>
	);
}
