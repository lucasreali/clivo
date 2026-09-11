import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDeactivateCustomer } from "#/api/gen/hooks";
import type { CustomerView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextArea } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";
import { Select } from "#/shared/ui/Select";

const REASONS = [
	"Moved to another city",
	"Duplicate record",
	"Customer request",
	"No contact for over two years",
	"Other reason",
];

type DeactivateCustomerDialogProps = {
	customer: CustomerView;
	onClose: () => void;
};

export function DeactivateCustomerDialog({
	customer,
	onClose,
}: DeactivateCustomerDialogProps) {
	const [reason, setReason] = useState(REASONS[0]);
	const [detail, setDetail] = useState("");
	const queryClient = useQueryClient();

	const deactivate = useDeactivateCustomer({
		mutation: {
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				onClose();
			},
		},
	});

	function confirm() {
		deactivate.mutate({
			path: { id: customer.id as string },
			body: { reason: detail ? `${reason} — ${detail}` : reason },
		});
	}

	return (
		<Modal
			title={`Deactivate ${customer.name ?? "customer"}?`}
			dismissal="guarded"
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Go back
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={deactivate.isPending}
					>
						Deactivate customer
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				This customer cannot be deleted because encounters, medical records and
				charges are attached to it, and the clinic is required to keep them.
				Deactivating removes the record from day-to-day searches and blocks new
				appointments, but the whole history stays reachable through the
				“Inactive” filter.
			</Callout>

			<Field label="Deactivation reason" required>
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

			<Field label="Reason details">
				{(id) => (
					<TextArea
						id={id}
						value={detail}
						onChange={(event) => setDetail(event.target.value)}
					/>
				)}
			</Field>

			{deactivate.isError ? (
				<Callout tone="danger">{messageOf(deactivate.error)}</Callout>
			) : null}
		</Modal>
	);
}
