import { useReceiveBatch } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import {
	submitHandler,
	useAppForm,
	useIsDirty,
	validatedBy,
} from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { useInventoryRefresh } from "../hooks/use-inventory-refresh";
import { batchRequestOf, batchSchema, EMPTY_BATCH } from "../model/batch-draft";

const FORM = "receive-batch";

type ReceiveBatchDrawerProps = {
	product: ProductView;
	onClose: () => void;
};

export function ReceiveBatchDrawer({
	product,
	onClose,
}: ReceiveBatchDrawerProps) {
	const refresh = useInventoryRefresh();

	const receive = useReceiveBatch({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: EMPTY_BATCH,
		...validatedBy(batchSchema),
		onSubmit: ({ value }) =>
			receive.mutate(
				{
					path: { productId: product.id as string },
					body: batchRequestOf(value),
				},
				{ onError: (error) => showViolations(error, form) },
			),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={`Receber lote de ${product.name ?? "produto"}`}
			subtitle="O recebimento soma ao saldo e passa a valer para a baixa por validade."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={receive.isPending}>
					Registrar recebimento
				</Button>
			}
		>
			<form
				id={FORM}
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4"
			>
				<form.AppField name="code">
					{(field) => (
						<field.TextField
							label="Código do lote"
							required
							placeholder="L-2026-014"
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-2 gap-3">
					<form.AppField name="expiresOn">
						{(field) => (
							<field.TextField label="Validade" type="date" required />
						)}
					</form.AppField>

					<form.AppField name="quantity">
						{(field) => (
							<field.NumberField
								label={`Quantidade (${product.unit ?? "un"})`}
								required
								min={0}
								step={1}
								placeholder="0"
							/>
						)}
					</form.AppField>
				</div>

				<form.AppField name="manufacturer">
					{(field) => (
						<field.TextField
							label="Fabricante"
							placeholder="Opcional — quem produziu o lote"
						/>
					)}
				</form.AppField>

				{receive.isError ? (
					<Callout tone="danger" title="Recebimento recusado">
						{messageOf(receive.error)}
					</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
