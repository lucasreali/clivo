import { useState } from "react";
import type { AppointmentView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { clockTime, isoDay, toInstant } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { Field, TextInput } from "#/shared/ui/Field";
import { useAppointmentActions } from "../hooks/use-appointment-actions";

type RescheduleAppointmentDrawerProps = {
	appointment: AppointmentView;
	onClose: () => void;
};

export function RescheduleAppointmentDrawer({
	appointment,
	onClose,
}: RescheduleAppointmentDrawerProps) {
	const scheduled = {
		day: isoDay(new Date(appointment.start ?? Date.now())),
		time: clockTime(appointment.start),
	};
	const [day, setDay] = useState(scheduled.day);
	const [time, setTime] = useState(scheduled.time);
	const { reschedule } = useAppointmentActions();

	function confirm() {
		reschedule.mutate(
			{
				path: { id: appointment.id as string },
				body: { start: toInstant(day, time) },
			},
			{ onSuccess: onClose },
		);
	}

	return (
		<Drawer
			title="Reagendar atendimento"
			subtitle={`${appointment.customerName ?? ""} · ${appointment.serviceName ?? ""} · ${appointment.practitionerName ?? ""}`}
			onClose={onClose}
			isDirty={day !== scheduled.day || time !== scheduled.time}
			footer={
				<Button onClick={confirm} disabled={reschedule.isPending}>
					Salvar novo horário
				</Button>
			}
		>
			<div className="grid gap-3">
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
		</Drawer>
	);
}
