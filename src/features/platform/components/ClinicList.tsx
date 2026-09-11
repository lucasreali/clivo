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
		header: "Name",
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
		header: "Status",
		meta: { width: "140px" },
		cell: ({ getValue }) => {
			const situation = describeClinicStatus(getValue());
			return <Badge tone={situation.tone}>{situation.label}</Badge>;
		},
	}),
	column.accessor("segment", {
		header: "Segment",
		meta: { width: "18%" },
		cell: ({ getValue }) => (
			<span className="truncate text-muted">{getValue() ?? "—"}</span>
		),
	}),
	column.accessor("createdAt", {
		header: "Joined",
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
				to="/console/clinics/$tenantId/modules"
				params={{ tenantId: String(row.original.id) }}
				className="text-[12.5px] font-semibold text-brand-ink"
			>
				Open
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
				title="Clinics"
				meta={summaryOf(catalog.total(), catalog.countOf("ACTIVE"))}
				actions={
					<Link to="/console/new-clinic" className={buttonClass()}>
						+ New clinic
					</Link>
				}
			/>

			<Page>
				<Panel>
					<div className="flex items-center gap-3 border-b border-line px-4 py-3">
						<TextInput
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by name or CNPJ"
							className="h-[34px] w-[320px]"
							aria-label="Search clinic"
						/>
						<Select
							value={status}
							onChange={setStatus}
							options={[
								{ value: "", label: "All statuses" },
								...CLINIC_SITUATIONS.map((situation) => ({
									value: situation.status,
									label: situation.label,
								})),
							]}
							className="h-[34px] w-[180px]"
							aria-label="Filter by status"
						/>
						<span className="ml-auto text-[12px] text-faint">
							{shown.total()} of {catalog.total()} listed
						</span>
					</div>

					<DataTable
						columns={COLUMNS}
						rows={shown.listed()}
						rowId={(clinic) => String(clinic.id)}
						isPending={isPending}
						pendingLabel="Loading clinics…"
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
				{clinic.legalName ?? "No legal name on record"}
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
				title="No clinics registered in this instance"
				description="Register the first clinic with a name, CNPJ and the initial manager. A clinic starts with no active modules — configuration comes later."
				actions={
					<Link to="/console/new-clinic" className={buttonClass()}>
						Register the first clinic
					</Link>
				}
			/>
		);
	}

	return (
		<EmptyState
			title={
				search ? `No clinic matches “${search}”` : "No clinic with this status"
			}
			description="The search covers name, legal name and CNPJ. Check the spelling or clear the status filter."
			actions={
				<Link to="/console/new-clinic" className={buttonClass("secondary")}>
					Register a new clinic
				</Link>
			}
		/>
	);
}

function summaryOf(total: number, active: number) {
	const clinics = total === 1 ? "tenant" : "tenants";
	return `${total} ${clinics} in this instance · ${active} active`;
}
