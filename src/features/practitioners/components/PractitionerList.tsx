import { useMemo, useState } from "react";
import { useListPractitioners } from "#/api/gen/hooks";
import type { PractitionerView } from "#/api/gen/types";
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
import { describePractitionerStatus } from "../model/practitioner-status";
import { availabilitySummary } from "../model/weekly-schedule";
import { AvailabilityDrawer } from "./AvailabilityDrawer";
import { DeactivatePractitionerDialog } from "./DeactivatePractitionerDialog";
import { PractitionerDrawer } from "./PractitionerDrawer";

const SITUATIONS = [
	{ label: "Ativos", value: "ACTIVE" },
	{ label: "Inativos", value: "INACTIVE" },
	{ label: "Todos", value: "" },
];

type Editing =
	| { kind: "details"; practitioner?: PractitionerView }
	| { kind: "availability"; practitioner: PractitionerView }
	| { kind: "deactivation"; practitioner: PractitionerView };

const column = columnsFor<PractitionerView>();

function columnsForPractitioners(
	onEdit: (editing: Editing) => void,
): TableColumns<PractitionerView> {
	return column.columns([
		column.accessor("name", {
			header: "Profissional",
			cell: ({ row }) => <PractitionerName practitioner={row.original} />,
		}),
		column.accessor("availability", {
			header: "Horários de atendimento",
			enableSorting: false,
			meta: { width: "32%" },
			cell: ({ getValue }) => (
				<Availability days={availabilitySummary(getValue())} />
			),
		}),
		column.accessor("status", {
			header: "Situação",
			meta: { width: "120px" },
			cell: ({ getValue }) => {
				const situation = describePractitionerStatus(getValue());
				return <Badge tone={situation.tone}>{situation.label}</Badge>;
			},
		}),
		column.display({
			id: "actions",
			meta: { width: "220px", align: "right" },
			cell: ({ row }) => (
				<PractitionerActions practitioner={row.original} onEdit={onEdit} />
			),
		}),
	]);
}

export function PractitionerList() {
	const [search, setSearch] = useState("");
	const [situation, setSituation] = useState("ACTIVE");
	const [editing, setEditing] = useState<Editing | undefined>();

	const practitioners = useListPractitioners({});

	const rows = useMemo(
		() => filtered(practitioners.data ?? [], search, situation),
		[practitioners.data, search, situation],
	);

	const columns = useMemo(() => columnsForPractitioners(setEditing), []);

	const close = () => setEditing(undefined);
	const register = () => setEditing({ kind: "details" });

	return (
		<>
			<AppTopBar
				title="Profissionais"
				meta={`${rows.length} ${rows.length === 1 ? "profissional listado" : "profissionais listados"}`}
				actions={<Button onClick={register}>+ Novo profissional</Button>}
			/>

			<Page>
				<div className="flex items-center gap-2.5">
					<SearchBox
						value={search}
						onChange={setSearch}
						placeholder="Buscar por nome ou registro"
						label="Buscar profissional"
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
						rowId={(practitioner) => String(practitioner.id)}
						isPending={practitioners.isPending}
						pendingLabel="Carregando profissionais…"
						pageSize={12}
						empty={
							<NoPractitioners
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
				<PractitionerDrawer
					practitioner={editing.practitioner}
					onClose={close}
				/>
			) : null}

			{editing?.kind === "availability" ? (
				<AvailabilityDrawer
					practitioner={editing.practitioner}
					onClose={close}
				/>
			) : null}

			{editing?.kind === "deactivation" ? (
				<DeactivatePractitionerDialog
					practitioner={editing.practitioner}
					onClose={close}
				/>
			) : null}
		</>
	);
}

/**
 * The API neither searches nor pages the practitioners, so the whole narrowing
 * happens here over one listing — one query, one cache entry.
 */
function filtered(
	practitioners: readonly PractitionerView[],
	search: string,
	situation: string,
) {
	const term = search.trim().toLowerCase();

	return practitioners.filter((practitioner) => {
		const named =
			term === "" ||
			(practitioner.name ?? "").toLowerCase().includes(term) ||
			(practitioner.licenseNumber ?? "").toLowerCase().includes(term);

		return named && (situation === "" || practitioner.status === situation);
	});
}

function PractitionerName({
	practitioner,
}: {
	practitioner: PractitionerView;
}) {
	return (
		<div className="flex min-w-0 flex-col leading-tight">
			<span className="truncate text-[13.5px] text-ink">
				{practitioner.name}
			</span>
			<span className="text-[11.5px] text-faint">
				{practitioner.licenseNumber
					? `Registro ${practitioner.licenseNumber}`
					: "Sem registro informado"}
			</span>
		</div>
	);
}

function Availability({ days }: { days: string[] }) {
	if (days.length === 0) {
		return <span className="text-[12.5px] text-warn">Sem horários</span>;
	}

	return (
		<div className="flex flex-col gap-0.5 text-[12.5px] text-muted tabular-nums">
			{days.map((day) => (
				<span key={day} className="truncate">
					{day}
				</span>
			))}
		</div>
	);
}

type PractitionerActionsProps = {
	practitioner: PractitionerView;
	onEdit: (editing: Editing) => void;
};

const ACTION = "text-[12.5px] text-brand hover:text-brand-ink";

function PractitionerActions({
	practitioner,
	onEdit,
}: PractitionerActionsProps) {
	if (practitioner.status !== "ACTIVE") {
		return null;
	}

	return (
		<div className="flex items-center justify-end gap-3">
			<button
				type="button"
				onClick={() => onEdit({ kind: "details", practitioner })}
				className={ACTION}
			>
				Editar
			</button>
			<button
				type="button"
				onClick={() => onEdit({ kind: "availability", practitioner })}
				className={ACTION}
			>
				Horários
			</button>
			<button
				type="button"
				onClick={() => onEdit({ kind: "deactivation", practitioner })}
				className="text-[12.5px] text-danger hover:text-danger-ink"
			>
				Inativar
			</button>
		</div>
	);
}

type NoPractitionersProps = {
	search: string;
	situation: string;
	onClearSearch: () => void;
	onRegister: () => void;
};

function NoPractitioners({
	search,
	situation,
	onClearSearch,
	onRegister,
}: NoPractitionersProps) {
	if (search) {
		return (
			<EmptyState
				title={`Nenhum profissional encontrado para “${search}”`}
				description="Confira a grafia do nome ou do registro, ou troque o filtro de situação."
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
				title="Nenhum profissional inativo"
				description="Todos os profissionais cadastrados estão ativos e podem receber agendamentos."
			/>
		);
	}

	return (
		<EmptyState
			title="Nenhum profissional cadastrado"
			description="A agenda marca consultas com um profissional dentro dos horários dele. Cadastre o primeiro para começar a agendar."
			actions={<Button onClick={onRegister}>Cadastrar profissional</Button>}
		/>
	);
}
