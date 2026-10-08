import { useMemo, useState } from "react";
import { useListServices } from "#/api/gen/hooks";
import type { ServiceView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { money } from "#/shared/format/money";
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
import { describeServiceStatus } from "../model/service-status";
import { DeactivateServiceDialog } from "./DeactivateServiceDialog";
import { ServiceDrawer } from "./ServiceDrawer";

const SITUATIONS = [
	{ label: "Ativos", value: "ACTIVE" },
	{ label: "Inativos", value: "INACTIVE" },
	{ label: "Todos", value: "" },
];

type Editing =
	| { kind: "details"; service?: ServiceView }
	| { kind: "deactivation"; service: ServiceView };

const column = columnsFor<ServiceView>();

function columnsForServices(
	onEdit: (editing: Editing) => void,
): TableColumns<ServiceView> {
	return column.columns([
		column.accessor("name", {
			header: "Serviço",
			cell: ({ getValue }) => (
				<span className="truncate text-[13.5px] text-ink">{getValue()}</span>
			),
		}),
		column.accessor("durationMinutes", {
			header: "Duração",
			meta: { width: "130px", align: "right" },
			cell: ({ getValue }) => (
				<span className="text-muted tabular-nums">
					{getValue() === undefined ? "—" : `${getValue()} min`}
				</span>
			),
		}),
		column.accessor("price", {
			header: "Preço",
			meta: { width: "140px", align: "right" },
			cell: ({ getValue }) => (
				<span className="text-ink tabular-nums">{money(getValue())}</span>
			),
		}),
		column.accessor("status", {
			header: "Situação",
			meta: { width: "120px" },
			cell: ({ getValue }) => {
				const situation = describeServiceStatus(getValue());
				return <Badge tone={situation.tone}>{situation.label}</Badge>;
			},
		}),
		column.display({
			id: "actions",
			meta: { width: "160px", align: "right" },
			cell: ({ row }) => (
				<ServiceActions service={row.original} onEdit={onEdit} />
			),
		}),
	]);
}

export function ServiceList() {
	const [search, setSearch] = useState("");
	const [situation, setSituation] = useState("ACTIVE");
	const [editing, setEditing] = useState<Editing | undefined>();

	const services = useListServices({});

	const rows = useMemo(
		() => filtered(services.data ?? [], search, situation),
		[services.data, search, situation],
	);

	const columns = useMemo(() => columnsForServices(setEditing), []);

	const close = () => setEditing(undefined);
	const register = () => setEditing({ kind: "details" });

	return (
		<>
			<AppTopBar
				title="Serviços"
				meta={`${rows.length} ${rows.length === 1 ? "serviço listado" : "serviços listados"}`}
				actions={<Button onClick={register}>+ Novo serviço</Button>}
			/>

			<Page>
				<div className="flex items-center gap-2.5">
					<SearchBox
						value={search}
						onChange={setSearch}
						placeholder="Buscar por nome do serviço"
						label="Buscar serviço"
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
						rowId={(service) => String(service.id)}
						isPending={services.isPending}
						pendingLabel="Carregando serviços…"
						pageSize={12}
						empty={
							<NoServices
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
				<ServiceDrawer service={editing.service} onClose={close} />
			) : null}

			{editing?.kind === "deactivation" ? (
				<DeactivateServiceDialog service={editing.service} onClose={close} />
			) : null}
		</>
	);
}

/**
 * The API neither searches nor pages the catalogue, so the whole narrowing
 * happens here over one listing — one query, one cache entry.
 */
function filtered(
	services: readonly ServiceView[],
	search: string,
	situation: string,
) {
	const term = search.trim().toLowerCase();

	return services.filter((service) => {
		const named =
			term === "" || (service.name ?? "").toLowerCase().includes(term);

		return named && (situation === "" || service.status === situation);
	});
}

type ServiceActionsProps = {
	service: ServiceView;
	onEdit: (editing: Editing) => void;
};

function ServiceActions({ service, onEdit }: ServiceActionsProps) {
	if (service.status !== "ACTIVE") {
		return null;
	}

	return (
		<div className="flex items-center justify-end gap-3">
			<button
				type="button"
				onClick={() => onEdit({ kind: "details", service })}
				className="text-[12.5px] text-brand hover:text-brand-ink"
			>
				Editar
			</button>
			<button
				type="button"
				onClick={() => onEdit({ kind: "deactivation", service })}
				className="text-[12.5px] text-danger hover:text-danger-ink"
			>
				Inativar
			</button>
		</div>
	);
}

type NoServicesProps = {
	search: string;
	situation: string;
	onClearSearch: () => void;
	onRegister: () => void;
};

function NoServices({
	search,
	situation,
	onClearSearch,
	onRegister,
}: NoServicesProps) {
	if (search) {
		return (
			<EmptyState
				title={`Nenhum serviço encontrado para “${search}”`}
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
				title="Nenhum serviço inativo"
				description="Todo o catálogo está ativo e disponível para agendamento."
			/>
		);
	}

	return (
		<EmptyState
			title="Nenhum serviço cadastrado"
			description="Cada consulta da agenda é de um serviço do catálogo, que define quanto tempo ela ocupa e quanto custa. Cadastre o primeiro para começar a agendar."
			actions={<Button onClick={onRegister}>Cadastrar serviço</Button>}
		/>
	);
}
