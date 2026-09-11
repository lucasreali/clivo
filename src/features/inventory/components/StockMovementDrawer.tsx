import { useStore } from "@tanstack/react-form";
import { useMoveStock } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import {
	submitHandler,
	useAppForm,
	useIsDirty,
	validatedBy,
} from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { quantityWithUnit } from "#/shared/format/number";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { useInventoryRefresh } from "../hooks/use-inventory-refresh";
import { REASON_MAX_LENGTH } from "../model/movement-reason";
import { DEFAULT_MOVEMENT, movementOptionsFor } from "../model/movement-type";
import {
	emptyStockEntry,
	stockEntryRequestOf,
	stockEntrySchema,
} from "../model/stock-entry-draft";

const FORM = "stock-movement";

const ADJUSTMENT = "ADJUSTMENT";

type StockMovementDrawerProps = {
	product: ProductView;
	onClose: () => void;
};

export function StockMovementDrawer({
	product,
	onClose,
}: StockMovementDrawerProps) {
	const refresh = useInventoryRefresh();

	const move = useMoveStock({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: emptyStockEntry(DEFAULT_MOVEMENT),
		...validatedBy(stockEntrySchema),
		onSubmit: ({ value }) =>
			move.mutate(
				{
					path: { id: product.id as string },
					body: stockEntryRequestOf(value),
				},
				{ onError: (error) => showViolations(error, form) },
			),
	});

	const isDirty = useIsDirty(form);

	// MEDIUM 8: an adjustment sets the balance rather than moving it, so the field
	// has to say so at the moment of typing — the option hint is gone by then.
	const type = useStore(form.store, (state) => state.values.type);
	const setsBalance = type === ADJUSTMENT;
	const unit = product.unit ?? "un";

	return (
		<Drawer
			title={`Movimentar ${product.name ?? "produto"}`}
			subtitle={`Saldo atual: ${quantityWithUnit(product.onHand, product.unit)}`}
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={move.isPending}>
					Registrar movimento
				</Button>
			}
		>
			<form
				id={FORM}
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4"
			>
				<form.AppField name="type">
					{(field) => (
						<field.SelectField
							label="Tipo de movimento"
							required
							options={movementOptionsFor(product.batchControlled)}
						/>
					)}
				</form.AppField>

				<form.AppField name="quantity">
					{(field) => (
						<field.NumberField
							label={
								setsBalance ? `Novo saldo (${unit})` : `Quantidade (${unit})`
							}
							required
							min={0}
							step={1}
							placeholder="0"
							hint={
								setsBalance
									? `O saldo passa a ser exatamente esta quantidade (hoje: ${quantityWithUnit(product.onHand, product.unit)}).`
									: "Soma ou subtrai do saldo atual."
							}
						/>
					)}
				</form.AppField>

				<form.AppField name="reason">
					{(field) => (
						<field.TextAreaField
							label="Motivo"
							required
							maxLength={REASON_MAX_LENGTH}
							placeholder="Compra do fornecedor, contagem mensal, quebra na bancada…"
						/>
					)}
				</form.AppField>

				{move.isError ? (
					<Callout tone="danger" title="Movimento recusado">
						{messageOf(move.error)}
					</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
