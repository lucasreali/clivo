import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useListProducts } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
import { useCapabilities } from "#/features/capabilities/hooks/use-capabilities";
import { MODULE } from "#/features/capabilities/model/module-code";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { quantity } from "#/shared/format/number";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import {
	columnsFor,
	DataTable,
	type TableColumns,
} from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel } from "#/shared/ui/Panel";
import { describeProductStatus } from "../model/product-status";
import { ExpiringBatches } from "./ExpiringBatches";
import { NewProductDrawer } from "./NewProductDrawer";
import { StockMovementDrawer } from "./StockMovementDrawer";

const SITUATIONS = [
	{ label: "Ativos", value: "ACTIVE" },
	{ label: "Abaixo do mínimo", value: "BELOW" },
	{ label: "Inativos", value: "INACTIVE" },
	{ label: "Todos", value: "" },
];

const FILTER =
	"flex h-9 items-center rounded-field px-3.5 text-[13px] whitespace-nowrap";

const column = columnsFor<ProductView>();

function columnsForInventory(
	showsBatches: boolean,
	onMove: (product: ProductView) => void,
): TableColumns<ProductView> {
	return column.columns([
		column.accessor("name", {
			header: "Produto",
			cell: ({ row }) => <ProductName product={row.original} />,
		}),
		column.accessor("onHand", {
			header: "Saldo",
			meta: { width: "16%", align: "right" },
			cell: ({ row }) => <Balance product={row.original} />,
		}),
		column.accessor("minStock", {
			header: "Mínimo",
			meta: { width: "12%", align: "right" },
			cell: ({ getValue }) => (
				<span className="text-muted">
					{getValue() ? quantity(getValue()) : "—"}
				</span>
			),
		}),
		// Variability mechanism A: the lot column only exists for a clinic that
		// contracted the batch module — the flag means nothing without it.
		...(showsBatches
			? column.columns([
					column.accessor("batchControlled", {
						header: "Lote",
						meta: { width: "120px" },
						cell: ({ getValue }) =>
							getValue() ? (
								<Badge tone="info">Controlado</Badge>
							) : (
								<span className="text-faint">—</span>
							),
					}),
				])
			: []),
		column.accessor("status", {
			header: "Situação",
			meta: { width: "130px" },
			cell: ({ getValue }) => {
				const situation = describeProductStatus(getValue());
				return <Badge tone={situation.tone}>{situation.label}</Badge>;
			},
		}),
		column.display({
			id: "actions",
			meta: { width: "170px", align: "right" },
			cell: ({ row }) => (
				<ProductActions product={row.original} onMove={onMove} />
			),
		}),
	]);
}

export function InventoryList() {
	const [search, setSearch] = useState("");
	const [situation, setSituation] = useState("ACTIVE");
	const [isRegistering, setRegistering] = useState(false);
	const [moving, setMoving] = useState<ProductView | undefined>();

	const { capabilities } = useCapabilities();
	const showsBatches = capabilities.modules.reaches(MODULE.batches);

	const products = useListProducts({});

	const rows = useMemo(
		() => filtered(products.data ?? [], search, situation),
		[products.data, search, situation],
	);

	const columns = useMemo(
		() => columnsForInventory(showsBatches, setMoving),
		[showsBatches],
	);

	return (
		<>
			<AppTopBar
				title="Estoque"
				meta={`${rows.length} ${rows.length === 1 ? "produto listado" : "produtos listados"}`}
				actions={
					<Button onClick={() => setRegistering(true)}>+ Novo produto</Button>
				}
			/>

			<Page>
				<ExpiringBatches />

				<div className="flex items-center gap-2.5">
					<SearchBox value={search} onChange={setSearch} />
					{SITUATIONS.map((option) => (
						<button
							key={option.label}
							type="button"
							onClick={() => setSituation(option.value)}
							aria-pressed={situation === option.value}
							className={cn(
								FILTER,
								situation === option.value
									? "bg-brand font-semibold text-white"
									: "border border-line bg-panel text-muted hover:border-brand hover:text-brand-ink",
							)}
						>
							{option.label}
						</button>
					))}
				</div>

				<Panel className="overflow-x-clip">
					<DataTable
						columns={columns}
						rows={rows}
						rowId={(product) => String(product.id)}
						isPending={products.isPending}
						pendingLabel="Carregando produtos…"
						pageSize={12}
						empty={
							<NoProducts
								search={search}
								situation={situation}
								onClearSearch={() => setSearch("")}
								onRegister={() => setRegistering(true)}
							/>
						}
					/>
				</Panel>
			</Page>

			{isRegistering ? (
				<NewProductDrawer onClose={() => setRegistering(false)} />
			) : null}

			{moving ? (
				<StockMovementDrawer
					product={moving}
					onClose={() => setMoving(undefined)}
				/>
			) : null}
		</>
	);
}

/**
 * Every row already carries `belowMinimum` and `status`, and the API neither
 * searches by name nor pages, so the whole narrowing happens here over one
 * listing — one query, one cache entry, no reload between tabs.
 */
function filtered(
	products: readonly ProductView[],
	search: string,
	situation: string,
) {
	const term = search.trim().toLowerCase();

	return products.filter((product) => {
		const named =
			term === "" || (product.name ?? "").toLowerCase().includes(term);

		return named && inSituation(product, situation);
	});
}

function inSituation(product: ProductView, situation: string) {
	if (situation === "INACTIVE") {
		return product.status === "INACTIVE";
	}
	if (situation === "BELOW") {
		return product.status === "ACTIVE" && product.belowMinimum === true;
	}
	if (situation === "ACTIVE") {
		return product.status === "ACTIVE";
	}
	return true;
}

function ProductName({ product }: { product: ProductView }) {
	return (
		<div className="flex min-w-0 flex-col leading-tight">
			<span className="truncate text-[13.5px] text-ink">{product.name}</span>
			<span className="text-[11.5px] text-faint">
				Unidade: {product.unit ?? "—"}
			</span>
		</div>
	);
}

function Balance({ product }: { product: ProductView }) {
	return (
		<span
			className={cn(
				"text-[13px] tabular-nums",
				product.belowMinimum ? "font-semibold text-warn" : "text-ink",
			)}
		>
			{quantity(product.onHand)}
		</span>
	);
}

type ProductActionsProps = {
	product: ProductView;
	onMove: (product: ProductView) => void;
};

function ProductActions({ product, onMove }: ProductActionsProps) {
	return (
		<div className="flex items-center justify-end gap-3">
			<button
				type="button"
				onClick={() => onMove(product)}
				className="text-[12.5px] text-brand hover:text-brand-ink"
			>
				Movimentar
			</button>
			<Link
				to="/estoque/$productId"
				params={{ productId: String(product.id) }}
				className="text-[12.5px] text-brand hover:text-brand-ink"
			>
				Abrir
			</Link>
		</div>
	);
}

type NoProductsProps = {
	search: string;
	situation: string;
	onClearSearch: () => void;
	onRegister: () => void;
};

const NOTHING_MATCHED: Record<string, { title: string; description: string }> =
	{
		BELOW: {
			title: "Nenhum produto abaixo do mínimo",
			description:
				"Todo o catálogo está com saldo acima do mínimo definido no cadastro. Nada a repor agora.",
		},
		INACTIVE: {
			title: "Nenhum produto inativo",
			description:
				"Todos os produtos do catálogo estão ativos e disponíveis para movimentação.",
		},
	};

function NoProducts({
	search,
	situation,
	onClearSearch,
	onRegister,
}: NoProductsProps) {
	if (search) {
		return (
			<EmptyState
				title={`Nenhum produto encontrado para “${search}”`}
				description="Confira a grafia do nome ou troque o filtro de situação."
				actions={
					<Button variant="secondary" onClick={onClearSearch}>
						Limpar busca
					</Button>
				}
			/>
		);
	}

	// An empty filter is not an empty catalogue, and offering "cadastrar produto"
	// to a clinic that has two hundred of them reads as if they had none.
	const matched = NOTHING_MATCHED[situation];
	if (matched) {
		return (
			<EmptyState title={matched.title} description={matched.description} />
		);
	}

	return (
		<EmptyState
			title="Nenhum produto cadastrado"
			description="O estoque acompanha o que a clínica mantém na prateleira e dá baixa no que sai durante o atendimento. Cadastre o primeiro produto para começar a contar."
			actions={<Button onClick={onRegister}>Cadastrar produto</Button>}
			footnote="Use os filtros acima para ver os inativos ou só o que está abaixo do mínimo."
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
				placeholder="Buscar por nome do produto"
				aria-label="Buscar produto"
				className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none"
			/>
			{value ? (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Limpar busca"
					className="text-faint hover:text-ink"
				>
					<X size={14} aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
}
