import { useDeactivateInsurancePlan } from "#/api/gen/hooks";
import type { PlanView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { usePlanRefresh } from "../hooks/use-plan-refresh";

type DeactivatePlanDialogProps = {
	plan: PlanView;
	onClose: () => void;
};

export function DeactivatePlanDialog({
	plan,
	onClose,
}: DeactivatePlanDialogProps) {
	const refresh = usePlanRefresh();

	const deactivate = useDeactivateInsurancePlan({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	return (
		<Modal
			title={`Inativar ${plan.name ?? "convênio"}?`}
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
							deactivate.mutate({ path: { id: plan.id as string } })
						}
						disabled={deactivate.isPending}
					>
						Inativar convênio
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				O convênio não é excluído, porque carteirinhas e cobranças já emitidas
				continuam apontando para ele. Ao inativar, ele deixa de reembolsar novas
				cobranças, mas segue visível pelo filtro “Inativos”.
			</Callout>

			{deactivate.isError ? (
				<Callout tone="danger">{messageOf(deactivate.error)}</Callout>
			) : null}
		</Modal>
	);
}
