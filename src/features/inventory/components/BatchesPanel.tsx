import { useState } from "react";
import { useListProductBatches } from "#/api/gen/hooks";
import type { BatchView, ProductView } from "#/api/gen/types";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
import { shortDay } from "#/shared/format/date";
import { quantity } from "#/shared/format/number";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import {
	columnsFor,
	DataTable,
	type TableColumns,
} from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { describeBatchStatus } from "../model/batch-status";
import { DiscardBatchDialog } from "./DiscardBatchDialog";
import { ReceiveBatchDrawer } from "./ReceiveBatchDrawer";

const column = columnsFor<BatchView>();

function columnsForBatches(
	onDiscard: (batch: BatchView) => void,
): TableColumns<BatchView> {
	return column.columns([
		column.accessor("code", {
			header: "Lote",
			cell: ({ row }) => <BatchCode batch={row.original} />,
		}),
		column.accessor("quantity", {
			header: "Recebido",
			meta: { width: "130px", align: "right" },
			cell: ({ getValue }) => (
				<span className="text-ink tabular-nums">{quantity(getValue())}</span>
			),
		}),
		column.accessor("expiresOn", {
			header: "Validade",
			meta: { width: "150px" },
			cell: ({ row }) => <Expiry batch={row.original} />,
		}),
		column.accessor("status", {
			header: "Situação",
			meta: { width: "140px" },
			cell: ({ getValue }) => {
				const situation = describeBatchStatus(getValue());
				return <Badge tone={situation.tone}>{situation.label}</Badge>;
			},
		}),
		column.display({
			id: "actions",
			meta: { width: "110px", align: "right" },
			cell: ({ row }) => (
				<BatchActions batch={row.original} onDiscard={onDiscard} />
			),
		}),
	]);
}

type BatchesPanelProps = {
	product: ProductView;
};

/**
 * Variability mechanism A: lots are a module of their own. A clinic without it
 * never sees this panel, and the product it describes works the same without
 * one — the core tracks the balance, the module tracks what it is made of.
 */
export function BatchesPanel({ product }: BatchesPanelProps) {
	return (
		<ModuleGate requires={MODULE.batches}>
			<Batches product={product} />
		</ModuleGate>
	);
}

function Batches({ product }: BatchesPanelProps) {
	if (!product.batchControlled) {
		return (
			<Panel>
				<PanelHeader title="Lotes" />
				<div className="px-4 py-5 text-[12.5px] text-muted leading-relaxed">
					Este produto não é controlado por lote, então suas entradas não pedem
					código nem validade. O controle é definido no cadastro do produto.
				</div>
			</Panel>
		);
	}

	return <BatchList product={product} />;
}

/** Split out so an uncontrolled product never mounts the query at all. */
function BatchList({ product }: BatchesPanelProps) {
	const [isReceiving, setReceiving] = useState(false);
	const [discarding, setDiscarding] = useState<BatchView | undefined>();

	const batches = useListProductBatches({
		path: { productId: product.id as string },
	});

	return (
		<>
			<Panel className="overflow-x-clip">
				<PanelHeader
					title="Lotes"
					hint="Cada entrada pertence a um lote com validade própria. A quantidade é a recebida — o saldo em uso é o do produto, acima."
					actions={
						<Button variant="secondary" onClick={() => setReceiving(true)}>
							Receber lote
						</Button>
					}
				/>
				<DataTable
					columns={columnsForBatches(setDiscarding)}
					rows={batches.data ?? []}
					rowId={(batch) => String(batch.id)}
					isPending={batches.isPending}
					pendingLabel="Carregando lotes…"
					empty={
						<EmptyState
							title="Nenhum lote recebido"
							description="Registre o recebimento para que o saldo deste produto passe a ter validade e rastreio por lote."
							actions={
								<Button onClick={() => setReceiving(true)}>Receber lote</Button>
							}
						/>
					}
				/>
			</Panel>

			{isReceiving ? (
				<ReceiveBatchDrawer
					product={product}
					onClose={() => setReceiving(false)}
				/>
			) : null}

			{discarding ? (
				<DiscardBatchDialog
					batch={discarding}
					onClose={() => setDiscarding(undefined)}
				/>
			) : null}
		</>
	);
}

function BatchCode({ batch }: { batch: BatchView }) {
	return (
		<div className="flex min-w-0 flex-col leading-tight">
			<span className="truncate text-[13.5px] text-ink">{batch.code}</span>
			<span className="text-[11.5px] text-faint">
				{batch.manufacturer ?? "Fabricante não informado"}
			</span>
		</div>
	);
}

function Expiry({ batch }: { batch: BatchView }) {
	if (batch.expired) {
		return <Badge tone="danger">{shortDay(batch.expiresOn)}</Badge>;
	}

	return <span className="text-muted">{shortDay(batch.expiresOn)}</span>;
}

type BatchActionsProps = {
	batch: BatchView;
	onDiscard: (batch: BatchView) => void;
};

function BatchActions({ batch, onDiscard }: BatchActionsProps) {
	if (batch.status === "DISCARDED") {
		return <span className="text-[12.5px] text-faint">—</span>;
	}

	return (
		<button
			type="button"
			onClick={() => onDiscard(batch)}
			className="text-[12.5px] text-danger hover:underline"
		>
			Descartar
		</button>
	);
}
