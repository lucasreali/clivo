import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSearchCustomers } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { shortDate } from "#/shared/format/date";
import { nationalId, phone } from "#/shared/format/document";
import { Avatar } from "#/shared/ui/Avatar";
import { Badge } from "#/shared/ui/Badge";
import { Button, buttonClass } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Menu, MenuItem } from "#/shared/ui/Menu";
import { Panel } from "#/shared/ui/Panel";
import { announcePending } from "#/shared/ui/pending";
import { describeCustomerStatus } from "../model/customer-status";

const COLUMNS = "grid-cols-[1.7fr_1fr_1.3fr_160px_96px]";

const SITUATIONS = [
	{ label: "Ativos", value: "ACTIVE" },
	{ label: "Inativos", value: "INACTIVE" },
	{ label: "Todos", value: "" },
];

const FILTER =
	"flex h-9 items-center rounded-field px-3.5 text-[13px] whitespace-nowrap";

export function CustomerList() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("ACTIVE");

	const customers = useSearchCustomers({ query: { name: search } });
	const rows = (customers.data ?? []).filter(
		(customer) => !status || customer.status === status,
	);

	return (
		<>
			<AppTopBar
				title="Clientes"
				meta={`${rows.length} ${rows.length === 1 ? "cadastro" : "cadastros"} listados`}
				actions={
					<Link to="/clientes/novo" className={buttonClass()}>
						+ Novo cliente
					</Link>
				}
			/>

			<Page>
				<div className="flex items-center gap-2.5">
					<SearchBox value={search} onChange={setSearch} />
					{SITUATIONS.map((situation) => (
						<button
							key={situation.label}
							type="button"
							onClick={() => setStatus(situation.value)}
							aria-pressed={status === situation.value}
							className={cn(
								FILTER,
								status === situation.value
									? "bg-brand font-semibold text-white"
									: "border border-line bg-panel text-muted hover:border-brand hover:text-brand-ink",
							)}
						>
							{situation.label}
						</button>
					))}
					<button
						type="button"
						onClick={() => announcePending("A exportação da lista em CSV")}
						className={cn(
							FILTER,
							"ml-auto border border-line bg-panel text-ink",
						)}
					>
						Exportar CSV
					</button>
				</div>

				<Panel className="overflow-hidden">
					<div
						className={cn(
							"grid border-b border-line bg-surface px-4 py-2.5 text-[11.5px] tracking-[0.3px] text-muted uppercase",
							COLUMNS,
						)}
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
							description="Confira a grafia do nome ou ajuste o filtro de situação. Se for a primeira visita, cadastre o cliente agora — leva menos de um minuto."
							actions={
								<>
									{search ? (
										<Button variant="secondary" onClick={() => setSearch("")}>
											Limpar busca
										</Button>
									) : null}
									<Link to="/clientes/novo" className={buttonClass()}>
										Cadastrar novo cliente
									</Link>
								</>
							}
							footnote="A busca considera o nome do cliente. Inclua os inativos pelo filtro acima."
						/>
					) : null}

					{rows.map((customer) => {
						const situation = describeCustomerStatus(customer.status);

						return (
							<div
								key={customer.id}
								className={cn(
									"grid items-center border-b border-line-soft px-4 py-[11px] last:border-b-0 hover:bg-row-hover",
									COLUMNS,
								)}
							>
								<div className="flex items-center gap-2.5">
									<Avatar
										name={customer.name ?? "?"}
										size="xs"
										tone="neutral"
									/>
									<div className="flex min-w-0 flex-col leading-tight">
										<span className="truncate text-[13.5px] text-ink">
											{customer.name}
										</span>
										<span className="text-[11.5px] text-faint">
											{nationalId(customer.nationalId)}
										</span>
									</div>
								</div>
								<span className="text-[13px] text-muted">
									{phone(customer.phone)}
								</span>
								<span className="text-[13px] text-muted">
									{shortDate(customer.birthDate)}
								</span>
								<Badge tone={situation.tone}>{situation.label}</Badge>
								<div className="flex items-center justify-end gap-3">
									<Link
										to="/clientes/$customerId"
										params={{ customerId: String(customer.id) }}
										className="text-[12.5px] text-brand hover:text-brand-ink"
									>
										Abrir
									</Link>
									<Menu label={`Mais ações de ${customer.name ?? "cliente"}`}>
										<MenuItem
											onClick={() =>
												announcePending("O agendamento a partir da lista")
											}
										>
											Novo agendamento
										</MenuItem>
										<MenuItem
											onClick={() => announcePending("O envio de mensagem")}
										>
											Enviar mensagem
										</MenuItem>
									</Menu>
								</div>
							</div>
						);
					})}
				</Panel>
			</Page>
		</>
	);
}

type SearchBoxProps = {
	value: string;
	onChange: (value: string) => void;
};

function SearchBox({ value, onChange }: SearchBoxProps) {
	return (
		<div
			className={cn(
				"flex h-9 max-w-[340px] flex-1 items-center gap-2 rounded-field border bg-panel px-3",
				value ? "border-brand" : "border-line",
			)}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				stroke={value ? "#1D9E75" : "#8B8A83"}
				strokeWidth="1.5"
				strokeLinecap="round"
				aria-hidden="true"
			>
				<circle cx="7" cy="7" r="4.4" />
				<path d="M10.3 10.3L14 14" />
			</svg>
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Buscar por nome, CPF ou telefone"
				aria-label="Buscar cliente"
				className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none"
			/>
			{value ? (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Limpar busca"
					className="text-[14px] text-faint hover:text-ink"
				>
					×
				</button>
			) : null}
		</div>
	);
}
