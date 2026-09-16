import { useStore } from "@tanstack/react-form";
import { useListProducts, useUseSupplies } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { quantityWithUnit } from "#/shared/format/number";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import type { Option } from "#/shared/ui/options";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import {
	amountOf,
	EMPTY_SUPPLY,
	supplyRequestOf,
	supplySchema,
} from "../model/supply-draft";
import { BatchPreview } from "./BatchPreview";

const FORM = "encounter-supplies";

type SuppliesPanelProps = {
	encounterId: string;
	open: boolean;
};

/**
 * Variability mechanism A: taking supplies out at the encounter is what the
 * stock module adds to a consultation. A clinic without it records the same
 * encounter and never sees this panel.
 */
export function SuppliesPanel({ encounterId, open }: SuppliesPanelProps) {
	return (
		<ModuleGate requires={MODULE.inventory}>
			<Supplies encounterId={encounterId} open={open} />
		</ModuleGate>
	);
}

function Supplies({ encounterId, open }: SuppliesPanelProps) {
	const products = useListProducts({});

	const dispense = useUseSupplies({
		mutation: { onSuccess: () => products.refetch() },
	});

	const form = useAppForm({
		defaultValues: EMPTY_SUPPLY,
		...validatedBy(supplySchema),
		onSubmit: ({ value, formApi }) =>
			dispense.mutate(
				{
					path: { encounterId },
					body: supplyRequestOf(value),
				},
				{
					onError: (error) => showViolations(error, formApi),
					onSuccess: () => formApi.reset(),
				},
			),
	});

	const productId = useStore(form.store, (state) => state.values.productId);
	const quantity = useStore(form.store, (state) => state.values.quantity);

	const available = (products.data ?? []).filter(isDispensable);
	const chosen = available.find((product) => product.id === productId);
	const amount = amountOf(quantity);

	const options: Option[] = available.map((product) => ({
		value: String(product.id),
		label: product.name ?? "Sem nome",
		hint: quantityWithUnit(product.onHand, product.unit),
	}));

	return (
		<Panel>
			<PanelHeader
				title="Insumos usados"
				hint="A baixa sai do estoque assim que é registrada, ainda com o atendimento aberto."
			/>

			<form
				id={FORM}
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4 p-4"
			>
				<form.AppField name="productId">
					{(field) => (
						<field.ComboboxField
							label="Produto"
							required
							disabled={!open}
							options={options}
							placeholder="Digite para buscar"
							emptyMessage="Nenhum produto disponível no estoque."
						/>
					)}
				</form.AppField>

				<form.AppField name="quantity">
					{(field) => (
						<field.NumberField
							label={`Quantidade${chosen?.unit ? ` (${chosen.unit})` : ""}`}
							required
							disabled={!open}
							min={0}
							step={1}
							placeholder="0"
							hint={
								chosen
									? `Em estoque: ${quantityWithUnit(chosen.onHand, chosen.unit)}`
									: undefined
							}
						/>
					)}
				</form.AppField>

				{chosen?.batchControlled && amount !== undefined && amount > 0 ? (
					<BatchPreview productId={String(chosen.id)} quantity={amount} />
				) : null}

				{dispense.isError ? (
					<Callout tone="danger" title="Baixa recusada">
						{messageOf(dispense.error)}
					</Callout>
				) : null}

				<Button
					type="submit"
					form={FORM}
					disabled={!open || dispense.isPending}
					className="self-end"
				>
					Registrar uso
				</Button>
			</form>
		</Panel>
	);
}

function isDispensable(product: ProductView) {
	return product.status === "ACTIVE";
}
