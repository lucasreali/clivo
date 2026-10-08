import { useDeactivateProduct } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { quantity } from "#/shared/format/number";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { useInventoryRefresh } from "../hooks/use-inventory-refresh";

type DeactivateProductDialogProps = {
	product: ProductView;
	onClose: () => void;
};

export function DeactivateProductDialog({
	product,
	onClose,
}: DeactivateProductDialogProps) {
	const refresh = useInventoryRefresh();
	const hasStock = (product.onHand ?? 0) > 0;

	const deactivate = useDeactivateProduct({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	return (
		<Modal
			title={`Inativar ${product.name ?? "produto"}?`}
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
							deactivate.mutate({ path: { id: product.id as string } })
						}
						disabled={deactivate.isPending}
					>
						Inativar produto
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				O produto não é excluído, porque as movimentações e os lotes registrados
				continuam apontando para ele. Ao inativar, ele sai da lista do dia a
				dia, mas o histórico segue acessível pelo filtro “Inativos”.
			</Callout>

			{hasStock ? (
				<Callout tone="warn" title="Ainda há saldo">
					Restam {quantity(product.onHand)} {product.unit} em estoque. Se o
					produto saiu de uso, registre o descarte antes para o saldo refletir a
					prateleira.
				</Callout>
			) : null}

			{deactivate.isError ? (
				<Callout tone="danger">{messageOf(deactivate.error)}</Callout>
			) : null}
		</Modal>
	);
}
