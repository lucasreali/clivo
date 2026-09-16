import { useSelectBatchForDispatch } from "#/api/gen/hooks";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
import { messageOf } from "#/shared/api-error";
import { Callout } from "#/shared/ui/Callout";

type BatchPreviewProps = {
	productId: string;
	quantity: number;
};

/**
 * Variability mechanism A. The lot a dispense will take from is decided by the
 * clinic's ExpiredBatchPolicy, and the two policies answer differently for the
 * same shelf: one refuses when nothing is within its expiry date, the other
 * hands over the expired lot with a warning. Showing that answer before the
 * write-off is what lets the typist see the rule rather than be surprised by it.
 */
export function BatchPreview({ productId, quantity }: BatchPreviewProps) {
	return (
		<ModuleGate requires={MODULE.batches}>
			<ChosenBatch productId={productId} quantity={quantity} />
		</ModuleGate>
	);
}

function ChosenBatch({ productId, quantity }: BatchPreviewProps) {
	const choice = useSelectBatchForDispatch(
		{ path: { productId }, query: { quantity } },
		{ query: { retry: false } },
	);

	if (choice.isPending) {
		return null;
	}

	if (choice.error) {
		return (
			<Callout tone="danger" title="Sem lote para esta baixa">
				{messageOf(choice.error)}
			</Callout>
		);
	}

	const warning = choice.data?.warning;

	return (
		<Callout
			tone={warning ? "warn" : "neutral"}
			title={`Sairá do lote ${choice.data?.code ?? "—"}`}
		>
			{warning ??
				"Lote dentro da validade, escolhido pela política da clínica."}
		</Callout>
	);
}
