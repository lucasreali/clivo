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
	"Patient request",
	"Practitioner unavailable",
	"Agreed reschedule",
	"Patient did not confirm",
	"Other reason",
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
			title={`Cancel the appointment for ${appointment.customerName ?? "customer"}?`}
			dismissal="guarded"
			subtitle={`${appointment.serviceName ?? "Encounter"} · ${appointment.practitionerName ?? ""} · ${shortDate(appointment.start)} at ${clockTime(appointment.start)}`}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Go back without cancelling
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={cancel.isPending}
					>
						Confirm cancellation
					</Button>
				</>
			}
		>
			<Field label="Cancellation reason" required>
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

			<Field label="Note (optional)">
				{(id) => (
					<TextArea
						id={id}
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="E.g.: the patient called two hours in advance."
					/>
				)}
			</Field>

			<Callout tone="neutral">
				The appointment is not deleted: it stays in the customer history as
				cancelled, with the reason and who cancelled it. The time slot becomes
				free on the schedule again.
			</Callout>

			{cancel.isError ? (
				<Callout tone="danger">{messageOf(cancel.error)}</Callout>
			) : null}
		</Modal>
	);
}
