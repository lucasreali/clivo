import { useDeactivateService } from "#/api/gen/hooks";
import type { ServiceView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { useServiceRefresh } from "../hooks/use-service-refresh";

type DeactivateServiceDialogProps = {
	service: ServiceView;
	onClose: () => void;
};

export function DeactivateServiceDialog({
	service,
	onClose,
}: DeactivateServiceDialogProps) {
	const refresh = useServiceRefresh();

	const deactivate = useDeactivateService({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	return (
		<Modal
			title={`Inativar ${service.name ?? "serviço"}?`}
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
							deactivate.mutate({ path: { id: service.id as string } })
						}
						disabled={deactivate.isPending}
					>
						Inativar serviço
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				O serviço não é excluído, porque consultas e cobranças já registradas
				continuam apontando para ele. Ao inativar, ele deixa de ser oferecido em
				novos agendamentos, mas segue visível pelo filtro “Inativos”.
			</Callout>

			{deactivate.isError ? (
				<Callout tone="danger">{messageOf(deactivate.error)}</Callout>
			) : null}
		</Modal>
	);
}
