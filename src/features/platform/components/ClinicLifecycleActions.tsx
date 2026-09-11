import { useState } from "react";
import { useGetClinic } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextArea } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";
import { useClinicLifecycle } from "../hooks/use-clinics";
import { isInService } from "../model/clinic-status";

export function ClinicLifecycleActions({ tenantId }: { tenantId: string }) {
	const [isAsking, setIsAsking] = useState(false);
	const clinic = useGetClinic({ path: { tenantId } });
	const lifecycle = useClinicLifecycle(tenantId);

	if (!isInService(clinic.data?.status)) {
		return (
			<Button
				variant="secondary"
				onClick={lifecycle.activate}
				disabled={lifecycle.isPending}
			>
				Reactivate clinic
			</Button>
		);
	}

	return (
		<>
			<Button variant="ghost" onClick={() => setIsAsking(true)}>
				Suspend clinic
			</Button>
			{isAsking ? (
				<SuspensionDialog
					lifecycle={lifecycle}
					onClose={() => setIsAsking(false)}
				/>
			) : null}
		</>
	);
}

type SuspensionDialogProps = {
	lifecycle: ReturnType<typeof useClinicLifecycle>;
	onClose: () => void;
};

function SuspensionDialog({ lifecycle, onClose }: SuspensionDialogProps) {
	const [reason, setReason] = useState("");

	function confirm() {
		lifecycle.deactivate(reason, onClose);
	}

	return (
		<Modal
			title="Suspend the clinic"
			dismissal="guarded"
			subtitle="The records are preserved; nobody on the customer side can sign in while the suspension lasts."
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Keep in service
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={reason.trim() === "" || lifecycle.isPending}
					>
						Suspend
					</Button>
				</>
			}
		>
			<Field
				label="Reason"
				required
				hint="It is recorded on the clinic and shown to whoever reactivates it."
			>
				{(id) => (
					<TextArea
						id={id}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						maxLength={200}
					/>
				)}
			</Field>

			{lifecycle.error ? (
				<Callout tone="danger">{messageOf(lifecycle.error)}</Callout>
			) : null}
		</Modal>
	);
}
