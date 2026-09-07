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
				Reativar clínica
			</Button>
		);
	}

	return (
		<>
			<Button variant="ghost" onClick={() => setIsAsking(true)}>
				Suspender clínica
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
		lifecycle.deactivate(reason);
		onClose();
	}

	return (
		<Modal
			title="Suspender a clínica"
			subtitle="Os registros são preservados; ninguém do lado do cliente consegue entrar enquanto a suspensão durar."
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Manter em serviço
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={reason.trim() === "" || lifecycle.isPending}
					>
						Suspender
					</Button>
				</>
			}
		>
			<Field
				label="Motivo"
				required
				hint="Fica registrado na clínica e aparece para quem for reativá-la."
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
