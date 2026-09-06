import { useState } from "react";
import type { AppointmentView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { clockTime, isoDay, toInstant } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextInput } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";
import { useAppointmentActions } from "../hooks/use-appointment-actions";

type RescheduleAppointmentDialogProps = {
	appointment: AppointmentView;
	onClose: () => void;
};

export function RescheduleAppointmentDialog({
	appointment,
	onClose,
}: RescheduleAppointmentDialogProps) {
	const start = new Date(appointment.start ?? Date.now());
	const [day, setDay] = useState(isoDay(start));
	const [time, setTime] = useState(clockTime(appointment.start));
	const { reschedule } = useAppointmentActions();

	function confirm() {
		reschedule.mutate(
			{
				path: { id: appointment.id as number },
				body: { start: toInstant(day, time) },
			},
			{ onSuccess: onClose },
		);
	}

	return (
		<Modal
			title="Reagendar atendimento"
			subtitle={`${appointment.customerName ?? ""} · ${appointment.serviceName ?? ""} · ${appointment.practitionerName ?? ""}`}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Descartar alterações
					</Button>
					<Button onClick={confirm} disabled={reschedule.isPending}>
						Salvar novo horário
					</Button>
				</>
			}
		>
			<div className="grid grid-cols-2 gap-3">
				<Field label="Nova data" required>
					{(id) => (
						<TextInput
							id={id}
							type="date"
							value={day}
							onChange={(event) => setDay(event.target.value)}
						/>
					)}
				</Field>
				<Field label="Nova hora" required>
					{(id) => (
						<TextInput
							id={id}
							type="time"
							value={time}
							onChange={(event) => setTime(event.target.value)}
						/>
					)}
				</Field>
			</div>

			<Callout tone="warn">
				O horário anterior fica registrado no histórico do atendimento. Se o
				módulo de notificações estiver ativo, o cliente é avisado ao salvar.
			</Callout>

			{reschedule.isError ? (
				<Callout tone="danger">{messageOf(reschedule.error)}</Callout>
			) : null}
		</Modal>
	);
}
