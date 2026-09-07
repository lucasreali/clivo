import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { shortDate } from "#/shared/format/date";
import { taxId } from "#/shared/format/document";
import { Badge } from "#/shared/ui/Badge";
import { buttonClass } from "#/shared/ui/Button";
import { EmptyState } from "#/shared/ui/EmptyState";
import { TextInput } from "#/shared/ui/Field";
import { Panel } from "#/shared/ui/Panel";
import { Select } from "#/shared/ui/Select";
import { useClinicCatalog } from "../hooks/use-clinics";
import {
	CLINIC_SITUATIONS,
	describeClinicStatus,
} from "../model/clinic-status";

const COLUMNS = "grid-cols-[2fr_170px_140px_1fr_110px_90px]";

export function ClinicList() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const { catalog, isPending } = useClinicCatalog();

	const shown = catalog.matching(search, status);

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

					<div
						className={`grid ${COLUMNS} gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase`}
					>
						<span>Nome</span>
						<span>CNPJ</span>
						<span>Situação</span>
						<span>Segmento</span>
						<span>Entrada</span>
						<span />
					</div>

					{isPending ? (
						<p className="px-4 py-10 text-center text-[12.5px] text-muted">
							Carregando clínicas…
						</p>
					) : null}

					{!isPending && shown.isEmpty() ? (
						<EmptyClinics search={search} platformIsEmpty={catalog.isEmpty()} />
					) : null}

					{shown.map((clinic) => {
						const situation = describeClinicStatus(clinic.status);

						return (
							<div
								key={clinic.id}
								className={`grid ${COLUMNS} items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0`}
							>
								<div className="flex min-w-0 flex-col">
									<span className="truncate font-medium text-ink">
										{clinic.name}
									</span>
									<span className="truncate text-[11.5px] text-muted">
										{clinic.legalName ?? "Sem razão social cadastrada"}
									</span>
								</div>
								<span className="font-mono text-[12px] text-muted">
									{taxId(clinic.taxId)}
								</span>
								<Badge tone={situation.tone}>{situation.label}</Badge>
								<span className="truncate text-muted">
									{clinic.segment ?? "—"}
								</span>
								<span className="text-muted">
									{shortDate(clinic.createdAt)}
								</span>
								<div className="flex justify-end">
									<Link
										to="/console/clinicas/$tenantId/modulos"
										params={{ tenantId: String(clinic.id) }}
										className="text-[12.5px] font-semibold text-brand-ink"
									>
										Abrir
									</Link>
								</div>
							</div>
						);
					})}
				</Panel>
			</Page>
		</>
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
