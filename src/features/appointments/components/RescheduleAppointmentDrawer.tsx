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
			title="Reschedule encounter"
			subtitle={`${appointment.customerName ?? ""} · ${appointment.serviceName ?? ""} · ${appointment.practitionerName ?? ""}`}
			onClose={onClose}
			isDirty={day !== scheduled.day || time !== scheduled.time}
			footer={
				<Button onClick={confirm} disabled={reschedule.isPending}>
					Save new time
				</Button>
			}
		>
			<div className="grid gap-3">
				<Field label="New date" required>
					{(id) => (
						<TextInput
							id={id}
							type="date"
							value={day}
							onChange={(event) => setDay(event.target.value)}
						/>
					)}
				</Field>
				<Field label="New time" required>
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
				The previous time stays in the encounter history. If the notifications
				module is active, the customer is notified once you save.
			</Callout>

			{reschedule.isError ? (
				<Callout tone="danger">{messageOf(reschedule.error)}</Callout>
			) : null}
		</Drawer>
	);
}
