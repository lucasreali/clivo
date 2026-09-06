import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSearchCustomers } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { nationalId, phone } from "#/shared/format/document";
import { Avatar } from "#/shared/ui/Avatar";
import { Badge } from "#/shared/ui/Badge";
import { buttonClass } from "#/shared/ui/Button";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Select, TextInput } from "#/shared/ui/Field";
import { Panel } from "#/shared/ui/Panel";
import { describeCustomerStatus } from "../model/customer-status";

const COLUMNS = "grid-cols-[2fr_1.2fr_1.2fr_140px_120px]";

export function CustomerList() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("ACTIVE");

	const customers = useSearchCustomers({ query: { name: search } });
	const rows = (customers.data ?? []).filter(
		(customer) => !status || customer.status === status,
	);

	return (
		<>
			<TopBar
				title="Clientes"
				meta={`${rows.length} ${rows.length === 1 ? "cadastro" : "cadastros"} listados`}
				actions={
					<Link to="/clientes/novo" className={buttonClass()}>
						+ Novo cliente
					</Link>
				}
			/>

			<Page>
				<Panel>
					<div className="flex items-center gap-3 border-b border-line px-4 py-3">
						<TextInput
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Buscar por nome"
							className="h-[34px] w-[320px]"
							aria-label="Buscar cliente"
						/>
						<Select
							value={status}
							onChange={(event) => setStatus(event.target.value)}
							className="h-[34px] w-[180px]"
							aria-label="Filtrar por situação"
						>
							<option value="">Todos</option>
							<option value="ACTIVE">Ativos</option>
							<option value="INACTIVE">Inativos</option>
						</Select>
					</div>

					<div
						className={`grid ${COLUMNS} gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase`}
					>
						<span>Nome</span>
						<span>Telefone</span>
						<span>Nascimento</span>
						<span>Situação</span>
						<span />
					</div>

					{customers.isPending ? (
						<p className="px-4 py-10 text-center text-[12.5px] text-muted">
							Carregando clientes…
						</p>
					) : null}

					{!customers.isPending && rows.length === 0 ? (
						<EmptyState
							title={
								search
									? `Nenhum cliente encontrado para “${search}”`
									: "Nenhum cliente cadastrado"
							}
							description="Confira a grafia do nome ou ajuste o filtro de situação. Se for a primeira visita, cadastre o cliente agora."
							actions={
								<Link to="/clientes/novo" className={buttonClass()}>
									Cadastrar novo cliente
								</Link>
							}
						/>
					) : null}

					{rows.map((customer) => {
						const situation = describeCustomerStatus(customer.status);

						return (
							<div
								key={customer.id}
								className={`grid ${COLUMNS} items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0`}
							>
								<div className="flex items-center gap-2.5">
									<Avatar name={customer.name ?? "?"} />
									<div className="flex min-w-0 flex-col">
										<span className="truncate font-medium text-ink">
											{customer.name}
										</span>
										<span className="text-[11.5px] text-muted">
											{nationalId(customer.nationalId)}
										</span>
									</div>
								</div>
								<span className="text-muted">{phone(customer.phone)}</span>
								<span className="text-muted">{customer.birthDate ?? "—"}</span>
								<Badge tone={situation.tone}>{situation.label}</Badge>
								<div className="flex justify-end">
									<Link
										to="/clientes/$customerId"
										params={{ customerId: String(customer.id) }}
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
