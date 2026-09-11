import { useListStockMovements } from "#/api/gen/hooks";
import type { ProductView, StockMovementView } from "#/api/gen/types";
import { dateTimeLabel } from "#/shared/format/date";
import { quantity } from "#/shared/format/number";
import { Badge } from "#/shared/ui/Badge";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { TONE_TEXT } from "#/shared/ui/tone";
import { describeMovementType } from "../model/movement-type";

const column = columnsFor<StockMovementView>();

const COLUMNS = column.columns([
	column.accessor("recordedAt", {
		header: "Quando",
		meta: { width: "24%" },
		cell: ({ getValue }) => (
			<span className="text-muted">{dateTimeLabel(getValue())}</span>
		),
	}),
	column.accessor("type", {
		header: "Movimento",
		meta: { width: "150px" },
		cell: ({ getValue }) => {
			const kind = describeMovementType(getValue());
			return <Badge tone={kind.tone}>{kind.label}</Badge>;
		},
	}),
	column.accessor("quantity", {
		header: "Quantidade",
		meta: { width: "140px", align: "right" },
		cell: ({ row }) => <Moved movement={row.original} />,
	}),
	column.accessor("reason", {
		header: "Motivo",
		cell: ({ row }) => <Reason movement={row.original} />,
	}),
]);

type StockMovementsProps = {
	product: ProductView;
};

export function StockMovements({ product }: StockMovementsProps) {
	const movements = useListStockMovements({
		path: { id: product.id as string },
	});
	const rows = movements.data ?? [];

	return (
		<Panel className="overflow-x-clip">
			<PanelHeader
				title="Movimentações"
				hint="Toda entrada, saída, ajuste e descarte deste produto, do mais recente ao mais antigo."
			/>
			<DataTable
				columns={COLUMNS}
				rows={rows}
				rowId={(movement) => String(movement.id)}
				isPending={movements.isPending}
				pendingLabel="Carregando movimentações…"
				pageSize={10}
				empty={
					<EmptyState
						title="Nenhuma movimentação registrada"
						description="O saldo deste produto ainda não mudou. Registre uma entrada para começar o histórico."
					/>
				}
			/>
		</Panel>
	);
}

function Moved({ movement }: { movement: StockMovementView }) {
	const kind = describeMovementType(movement.type);

	return (
		<span className="text-[13px] text-ink tabular-nums">
			<span className={TONE_TEXT[kind.tone]}>{kind.mark} </span>
			{quantity(movement.quantity)}
		</span>
	);
}

/** A movement raised by an encounter carries no typed reason of its own. */
function Reason({ movement }: { movement: StockMovementView }) {
	if (movement.reason) {
		return <span className="text-muted">{movement.reason}</span>;
	}

	return (
		<span className="text-faint">
			{movement.encounterId ? "Baixa pelo atendimento" : "—"}
		</span>
	);
}
