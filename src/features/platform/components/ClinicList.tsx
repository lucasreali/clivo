import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ClinicView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { shortDate } from "#/shared/format/date";
import { taxId } from "#/shared/format/document";
import { Badge } from "#/shared/ui/Badge";
import { buttonClass } from "#/shared/ui/Button";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { TextInput } from "#/shared/ui/Field";
import { Panel } from "#/shared/ui/Panel";
import { Select } from "#/shared/ui/Select";
import { useClinicCatalog } from "../hooks/use-clinics";
import {
	CLINIC_SITUATIONS,
	describeClinicStatus,
} from "../model/clinic-status";

const column = columnsFor<ClinicView>();

const COLUMNS = column.columns([
	column.accessor("name", {
		header: "Nome",
		cell: ({ row }) => <ClinicName clinic={row.original} />,
	}),
	column.accessor("taxId", {
		header: "CNPJ",
		meta: { width: "170px" },
		cell: ({ getValue }) => (
			<span className="font-mono text-[12px] text-muted">
				{taxId(getValue())}
			</span>
		),
	}),
	column.accessor("status", {
		header: "Situação",
		meta: { width: "140px" },
		cell: ({ getValue }) => {
			const situation = describeClinicStatus(getValue());
			return <Badge tone={situation.tone}>{situation.label}</Badge>;
		},
	}),
	column.accessor("segment", {
		header: "Segmento",
		meta: { width: "18%" },
		cell: ({ getValue }) => (
			<span className="truncate text-muted">{getValue() ?? "—"}</span>
		),
	}),
	column.accessor("createdAt", {
		header: "Entrada",
		meta: { width: "110px" },
		cell: ({ getValue }) => (
			<span className="text-muted">{shortDate(getValue())}</span>
		),
	}),
	column.display({
		id: "actions",
		meta: { width: "90px", align: "right" },
		cell: ({ row }) => (
			<Link
				to="/console/clinicas/$tenantId/modulos"
				params={{ tenantId: String(row.original.id) }}
				className="text-[12.5px] font-semibold text-brand-ink"
			>
				Abrir
			</Link>
		),
	}),
]);

export function ClinicList() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const { catalog, isPending } = useClinicCatalog();

	const shown = useMemo(
		() => catalog.matching(search, status),
		[catalog, search, status],
	);

	return (
		<>
			<TopBar
				title="Clínicas"
				meta={summaryOf(catalog.total(), catalog.countOf("ACTIVE"))}
				actions={
					<Link to="/console/nova-clinica" className={buttonClass()}>
						+ Nova clínica
					</Link>
				}
			/>

			<Page>
				<Panel>
					<div className="flex items-center gap-3 border-b border-line px-4 py-3">
						<TextInput
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Buscar por nome ou CNPJ"
							className="h-[34px] w-[320px]"
							aria-label="Buscar clínica"
						/>
						<Select
							value={status}
							onChange={setStatus}
							options={[
								{ value: "", label: "Todas as situações" },
								...CLINIC_SITUATIONS.map((situation) => ({
									value: situation.status,
									label: situation.label,
								})),
							]}
							className="h-[34px] w-[180px]"
							aria-label="Filtrar por situação"
						/>
						<span className="ml-auto text-[12px] text-faint">
							{shown.total()} de {catalog.total()} listadas
						</span>
					</div>

					<DataTable
						columns={COLUMNS}
						rows={shown.listed()}
						rowId={(clinic) => String(clinic.id)}
						isPending={isPending}
						pendingLabel="Carregando clínicas…"
						pageSize={12}
						empty={
							<EmptyClinics
								search={search}
								platformIsEmpty={catalog.isEmpty()}
							/>
						}
					/>
				</Panel>
			</Page>
		</>
	);
}

function ClinicName({ clinic }: { clinic: ClinicView }) {
	return (
		<div className="flex min-w-0 flex-col">
			<span className="truncate font-medium text-ink">{clinic.name}</span>
			<span className="truncate text-[11.5px] text-muted">
				{clinic.legalName ?? "Sem razão social cadastrada"}
			</span>
		</div>
	);
}

type EmptyClinicsProps = {
	search: string;
	platformIsEmpty: boolean;
};

function EmptyClinics({ search, platformIsEmpty }: EmptyClinicsProps) {
	if (platformIsEmpty) {
		return (
			<EmptyState
				title="Nenhuma clínica cadastrada nesta instância"
				description="Cadastre a primeira clínica com nome, CNPJ e o gestor inicial. A clínica nasce sem módulos ativos — a configuração vem depois."
				actions={
					<Link to="/console/nova-clinica" className={buttonClass()}>
						Cadastrar primeira clínica
					</Link>
				}
			/>
		);
	}

	return (
		<EmptyState
			title={
				search
					? `Nenhuma clínica corresponde a “${search}”`
					: "Nenhuma clínica nesta situação"
			}
			description="A busca cobre nome, razão social e CNPJ. Confira a grafia ou limpe o filtro de situação."
			actions={
				<Link to="/console/nova-clinica" className={buttonClass("secondary")}>
					Cadastrar nova clínica
				</Link>
			}
		/>
	);
}

function summaryOf(total: number, active: number) {
	const clinics = total === 1 ? "inquilino" : "inquilinos";
	return `${total} ${clinics} nesta instância · ${active} ${active === 1 ? "ativa" : "ativas"}`;
}
