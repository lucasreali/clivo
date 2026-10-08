import { useMemo, useState } from "react";
import { useListInsurancePlans } from "#/api/gen/hooks";
import type { PlanView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import {
	columnsFor,
	DataTable,
	type TableColumns,
} from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel } from "#/shared/ui/Panel";
import { SearchBox, SituationFilter } from "#/shared/ui/SearchBox";
import { percentageLabel } from "../model/plan-draft";
import { describePlanStatus } from "../model/plan-status";
import { DeactivatePlanDialog } from "./DeactivatePlanDialog";
import { PlanDrawer } from "./PlanDrawer";

const SITUATIONS = [
	{ label: "Ativos", value: "ACTIVE" },
	{ label: "Inativos", value: "INACTIVE" },
	{ label: "Todos", value: "" },
];

type Editing =
	| { kind: "details"; plan?: PlanView }
	| { kind: "deactivation"; plan: PlanView };

const column = columnsFor<PlanView>();

function columnsForPlans(
	onEdit: (editing: Editing) => void,
): TableColumns<PlanView> {
	return column.columns([
		column.accessor("name", {
			header: "Operadora",
			cell: ({ getValue }) => (
				<span className="truncate text-[13.5px] text-ink">{getValue()}</span>
			),
		}),
		column.accessor("reimbursementPercentage", {
			header: "Reembolso",
			meta: { width: "150px", align: "right" },
			cell: ({ getValue }) => (
				<span className="text-ink tabular-nums">
					{percentageLabel(getValue())}
				</span>
			),
		}),
		column.accessor("status", {
			header: "Situação",
			meta: { width: "120px" },
			cell: ({ getValue }) => {
				const situation = describePlanStatus(getValue());
				return <Badge tone={situation.tone}>{situation.label}</Badge>;
			},
		}),
		column.display({
			id: "actions",
			meta: { width: "160px", align: "right" },
			cell: ({ row }) => <PlanActions plan={row.original} onEdit={onEdit} />,
		}),
	]);
}

/** Variability mechanism A: the route renders this only for a clinic with the insurance module. */
export function PlanList() {
	const [search, setSearch] = useState("");
	const [situation, setSituation] = useState("ACTIVE");
	const [editing, setEditing] = useState<Editing | undefined>();

	const plans = useListInsurancePlans();

	const rows = useMemo(
		() => filtered(plans.data ?? [], search, situation),
		[plans.data, search, situation],
	);

	const columns = useMemo(() => columnsForPlans(setEditing), []);

	const close = () => setEditing(undefined);
	const register = () => setEditing({ kind: "details" });

	return (
		<>
			<AppTopBar
				title="Convênios"
				meta={`${rows.length} ${rows.length === 1 ? "convênio listado" : "convênios listados"}`}
				actions={<Button onClick={register}>+ Novo convênio</Button>}
			/>

			<Page>
				<div className="flex items-center gap-2.5">
					<SearchBox
						value={search}
						onChange={setSearch}
						placeholder="Buscar por operadora"
						label="Buscar convênio"
					/>
					<SituationFilter
						options={SITUATIONS}
						value={situation}
						onChange={setSituation}
					/>
				</div>

				<Panel className="overflow-x-clip">
					<DataTable
						columns={columns}
						rows={rows}
						rowId={(plan) => String(plan.id)}
						isPending={plans.isPending}
						pendingLabel="Carregando convênios…"
						pageSize={12}
						empty={
							<NoPlans
								search={search}
								situation={situation}
								onClearSearch={() => setSearch("")}
								onRegister={register}
							/>
						}
					/>
				</Panel>
			</Page>

			{editing?.kind === "details" ? (
				<PlanDrawer plan={editing.plan} onClose={close} />
			) : null}

			{editing?.kind === "deactivation" ? (
				<DeactivatePlanDialog plan={editing.plan} onClose={close} />
			) : null}
		</>
	);
}

function filtered(
	plans: readonly PlanView[],
	search: string,
	situation: string,
) {
	const term = search.trim().toLowerCase();

	return plans.filter((plan) => {
		const named = term === "" || (plan.name ?? "").toLowerCase().includes(term);

		return named && (situation === "" || plan.status === situation);
	});
}

type PlanActionsProps = {
	plan: PlanView;
	onEdit: (editing: Editing) => void;
};

function PlanActions({ plan, onEdit }: PlanActionsProps) {
	if (plan.status !== "ACTIVE") {
		return null;
	}

	return (
		<div className="flex items-center justify-end gap-3">
			<button
				type="button"
				onClick={() => onEdit({ kind: "details", plan })}
				className="text-[12.5px] text-brand hover:text-brand-ink"
			>
				Editar
			</button>
			<button
				type="button"
				onClick={() => onEdit({ kind: "deactivation", plan })}
				className="text-[12.5px] text-danger hover:text-danger-ink"
			>
				Inativar
			</button>
		</div>
	);
}

type NoPlansProps = {
	search: string;
	situation: string;
	onClearSearch: () => void;
	onRegister: () => void;
};

function NoPlans({
	search,
	situation,
	onClearSearch,
	onRegister,
}: NoPlansProps) {
	if (search) {
		return (
			<EmptyState
				title={`Nenhum convênio encontrado para “${search}”`}
				description="Confira a grafia do nome ou troque o filtro de situação."
				actions={
					<Button variant="secondary" onClick={onClearSearch}>
						Limpar busca
					</Button>
				}
			/>
		);
	}

	if (situation === "INACTIVE") {
		return (
			<EmptyState
				title="Nenhum convênio inativo"
				description="Todos os convênios cadastrados estão ativos."
			/>
		);
	}

	return (
		<EmptyState
			title="Nenhum convênio cadastrado"
			description="Um convênio paga parte da conta do cliente vinculado a ele. Cadastre a primeira operadora para começar a vincular carteirinhas."
			actions={<Button onClick={onRegister}>Cadastrar convênio</Button>}
		/>
	);
}
