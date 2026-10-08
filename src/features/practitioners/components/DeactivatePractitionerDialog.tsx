import { useDeactivatePractitioner } from "#/api/gen/hooks";
import type { PractitionerView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { usePractitionerRefresh } from "../hooks/use-practitioner-refresh";

type DeactivatePractitionerDialogProps = {
	practitioner: PractitionerView;
	onClose: () => void;
};

export function DeactivatePractitionerDialog({
	practitioner,
	onClose,
}: DeactivatePractitionerDialogProps) {
	const refresh = usePractitionerRefresh();

	const deactivate = useDeactivatePractitioner({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	return (
		<Modal
			title={`Inativar ${practitioner.name ?? "profissional"}?`}
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
							deactivate.mutate({ path: { id: practitioner.id as string } })
						}
						disabled={deactivate.isPending}
					>
						Inativar profissional
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				O profissional não é excluído, porque atendimentos, prontuários e
				comissões já registrados continuam apontando para ele. Ao inativar, ele
				deixa de receber novos agendamentos, mas o histórico permanece acessível
				pelo filtro “Inativos”.
			</Callout>

			{deactivate.isError ? (
				<Callout tone="danger">{messageOf(deactivate.error)}</Callout>
			) : null}
		</Modal>
	);
}
