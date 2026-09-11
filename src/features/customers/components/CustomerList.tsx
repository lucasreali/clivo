import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSearchCustomers } from "#/api/gen/hooks";
import type { CustomerView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { shortDate } from "#/shared/format/date";
import { nationalId, phone } from "#/shared/format/document";
import { Avatar } from "#/shared/ui/Avatar";
import { Badge } from "#/shared/ui/Badge";
import { Button, buttonClass } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Menu, MenuItem } from "#/shared/ui/Menu";
import { Panel } from "#/shared/ui/Panel";
import { announcePending } from "#/shared/ui/pending";
import { describeCustomerStatus } from "../model/customer-status";

const SITUATIONS = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
	{ label: "All", value: "" },
];

const FILTER =
	"flex h-9 items-center rounded-field px-3.5 text-[13px] whitespace-nowrap";

const column = columnsFor<CustomerView>();

const COLUMNS = column.columns([
	column.accessor("name", {
		header: "Name",
		cell: ({ row }) => <CustomerName customer={row.original} />,
	}),
	column.accessor("phone", {
		header: "Phone",
		meta: { width: "19%" },
		cell: ({ getValue }) => (
			<span className="text-muted">{phone(getValue())}</span>
		),
	}),
	column.accessor("birthDate", {
		header: "Date of birth",
		meta: { width: "25%" },
		cell: ({ getValue }) => (
			<span className="text-muted">{shortDate(getValue())}</span>
		),
	}),
	column.accessor("status", {
		header: "Status",
		meta: { width: "160px" },
		cell: ({ getValue }) => {
			const situation = describeCustomerStatus(getValue());
			return <Badge tone={situation.tone}>{situation.label}</Badge>;
		},
	}),
	column.display({
		id: "actions",
		meta: { width: "96px", align: "right" },
		cell: ({ row }) => <CustomerActions customer={row.original} />,
	}),
]);

export function CustomerList() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("ACTIVE");

	const customers = useSearchCustomers({ query: { name: search } });
	const rows = useMemo(
		() =>
			(customers.data ?? []).filter(
				(customer) => !status || customer.status === status,
			),
		[customers.data, status],
	);

	return (
		<>
			<AppTopBar
				title="Customers"
				meta={`${rows.length} ${rows.length === 1 ? "record" : "records"} listed`}
				actions={
					<Link to="/customers/new" className={buttonClass()}>
						+ New customer
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
						onClick={() => announcePending("Exporting the list as CSV")}
						className={cn(
							FILTER,
							"ml-auto border border-line bg-panel text-ink",
						)}
					>
						Export CSV
					</button>
				</div>

				<Panel className="overflow-x-clip">
					<DataTable
						columns={COLUMNS}
						rows={rows}
						rowId={(customer) => String(customer.id)}
						isPending={customers.isPending}
						pendingLabel="Loading customers…"
						pageSize={12}
						empty={
							<NoCustomers
								search={search}
								onClearSearch={() => setSearch("")}
							/>
						}
					/>
				</Panel>
			</Page>
		</>
	);
}

function CustomerName({ customer }: { customer: CustomerView }) {
	return (
		<div className="flex items-center gap-2.5">
			<Avatar name={customer.name ?? "?"} size="xs" tone="neutral" />
			<div className="flex min-w-0 flex-col leading-tight">
				<span className="truncate text-[13.5px] text-ink">{customer.name}</span>
				<span className="text-[11.5px] text-faint">
					{nationalId(customer.nationalId)}
				</span>
			</div>
		</div>
	);
}

function CustomerActions({ customer }: { customer: CustomerView }) {
	return (
		<div className="flex items-center justify-end gap-3">
			<Link
				to="/customers/$customerId"
				params={{ customerId: String(customer.id) }}
				className="text-[12.5px] text-brand hover:text-brand-ink"
			>
				Open
			</Link>
			<Menu label={`More actions for ${customer.name ?? "customer"}`}>
				<MenuItem onClick={() => announcePending("Scheduling from the list")}>
					New appointment
				</MenuItem>
				<MenuItem onClick={() => announcePending("Sending a message")}>
					Send message
				</MenuItem>
			</Menu>
		</div>
	);
}

type NoCustomersProps = {
	search: string;
	onClearSearch: () => void;
};

function NoCustomers({ search, onClearSearch }: NoCustomersProps) {
	return (
		<EmptyState
			title={
				search ? `No customer found for “${search}”` : "No customers registered"
			}
			description="Check the spelling of the name or adjust the status filter. If this is a first visit, register the customer now — it takes less than a minute."
			actions={
				<>
					{search ? (
						<Button variant="secondary" onClick={onClearSearch}>
							Clear search
						</Button>
					) : null}
					<Link to="/customers/new" className={buttonClass()}>
						Register new customer
					</Link>
				</>
			}
			footnote="The search matches the customer name. Include inactive ones with the filter above."
		/>
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
			<MagnifyingGlass
				size={14}
				className={cn("shrink-0", value ? "text-brand" : "text-faint")}
				aria-hidden="true"
			/>
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Search by name, CPF or phone"
				aria-label="Search customer"
				className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none"
			/>
			{value ? (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Clear search"
					className="text-faint hover:text-ink"
				>
					<X size={14} aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
}
