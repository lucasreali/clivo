import { useCloseCommissionPeriod } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { money } from "#/shared/format/money";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { useCommissionRefresh } from "../hooks/use-commission-refresh";
import { type Period, periodLabel } from "../model/period";

type CloseCommissionDialogProps = {
	period: Period;
	total: number | undefined;
	onClose: () => void;
};

export function CloseCommissionDialog({
	period,
	total,
	onClose,
}: CloseCommissionDialogProps) {
	const refresh = useCommissionRefresh();

	const close = useCloseCommissionPeriod({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	function confirm() {
		close.mutate({ query: { year: period.year, month: period.month } });
	}

	return (
		<Modal
			title={`Fechar ${periodLabel(period)}?`}
			dismissal="guarded"
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Voltar
					</Button>
					<Button onClick={confirm} disabled={close.isPending}>
						Fechar mês
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				O fechamento congela {money(total)} em comissões deste mês. Atendimentos
				faturados depois disso entram no mês seguinte, e alterar um percentual
				não muda mais o que já ficou registrado aqui.
			</Callout>

			{close.isError ? (
				<Callout tone="danger">{messageOf(close.error)}</Callout>
			) : null}
		</Modal>
	);
}
