import { useState } from "react";
import { useListCommissionRates } from "#/api/gen/hooks";
import type { RateView } from "#/api/gen/types";
import {
	columnsFor,
	DataTable,
	type TableColumns,
} from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { CommissionRateDrawer } from "./CommissionRateDrawer";

const column = columnsFor<RateView>();

function columnsForRates(
	onEdit: (rate: RateView) => void,
): TableColumns<RateView> {
	return column.columns([
		column.accessor("practitionerName", {
			header: "Profissional",
			cell: ({ getValue }) => (
				<span className="text-[13.5px] text-ink">{getValue() ?? "—"}</span>
			),
		}),
		column.accessor("percentage", {
			header: "Percentual",
			meta: { width: "160px", align: "right" },
			cell: ({ getValue }) => (
				<span className="text-ink tabular-nums">
					{getValue() === undefined
						? "—"
						: `${String(getValue()).replace(".", ",")}%`}
				</span>
			),
		}),
		column.display({
			id: "actions",
			meta: { width: "110px", align: "right" },
			cell: ({ row }) => (
				<button
					type="button"
					onClick={() => onEdit(row.original)}
					className="text-[12.5px] text-brand hover:text-brand-ink"
				>
					Alterar
				</button>
			),
		}),
	]);
}

export function CommissionRates() {
	const [editing, setEditing] = useState<RateView | undefined>();
	const rates = useListCommissionRates({});

	return (
		<>
			<Panel className="overflow-x-clip">
				<PanelHeader
					title="Percentuais por profissional"
					hint="Quem não tem percentual definido não gera comissão."
				/>
				<DataTable
					columns={columnsForRates(setEditing)}
					rows={rates.data ?? []}
					rowId={(rate) => String(rate.practitionerId)}
					isPending={rates.isPending}
					pendingLabel="Carregando percentuais…"
					empty={
						<EmptyState
							title="Nenhum percentual definido"
							description="Defina o percentual de cada profissional para que os atendimentos faturados passem a gerar comissão."
						/>
					}
				/>
			</Panel>

			{editing ? (
				<CommissionRateDrawer
					rate={editing}
					onClose={() => setEditing(undefined)}
				/>
			) : null}
		</>
	);
}
