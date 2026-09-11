import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useGetProduct } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { statusOf } from "#/shared/api-error";
import { quantity } from "#/shared/format/number";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel } from "#/shared/ui/Panel";
import { describeProductStatus } from "../model/product-status";
import { BatchesPanel } from "./BatchesPanel";
import { StockMovementDrawer } from "./StockMovementDrawer";
import { StockMovements } from "./StockMovements";

type ProductDetailProps = {
	productId: string;
};

export function ProductDetail({ productId }: ProductDetailProps) {
	const [isMoving, setMoving] = useState(false);
	const product = useGetProduct({ path: { id: productId } });

	if (product.isPending) {
		return (
			<>
				<AppTopBar title="Estoque" meta="Carregando produto…" />
				<Page>
					<Panel>
						<p className="m-0 px-4 py-5 text-[12.5px] text-muted">
							Carregando produto…
						</p>
					</Panel>
				</Page>
			</>
		);
	}

	if (!product.data) {
		const missing = statusOf(product.error) === 404;
		return (
			<>
				<AppTopBar
					title="Estoque"
					meta={
						missing ? "Produto não encontrado" : "Não foi possível carregar"
					}
				/>
				<Page>
					<Panel>
						<EmptyState
							title={
								missing
									? "Produto não encontrado"
									: "Não foi possível carregar o produto"
							}
							description={
								missing
									? "Ele pode ter sido removido, ou o endereço está incorreto."
									: "A consulta ao estoque falhou. Tente novamente em instantes."
							}
							actions={
								<Link to="/estoque">
									<Button variant="secondary">Voltar ao estoque</Button>
								</Link>
							}
						/>
					</Panel>
				</Page>
			</>
		);
	}

	const item = product.data;

	return (
		<>
			<AppTopBar
				title={item.name ?? "Produto"}
				meta="Estoque › Produto"
				actions={<Button onClick={() => setMoving(true)}>Movimentar</Button>}
			/>

			<Page>
				<Summary product={item} />
				<BatchesPanel product={item} />
				<StockMovements product={item} />
			</Page>

			{isMoving ? (
				<StockMovementDrawer product={item} onClose={() => setMoving(false)} />
			) : null}
		</>
	);
}

function Summary({ product }: { product: ProductView }) {
	const situation = describeProductStatus(product.status);

	return (
		<div className="grid grid-cols-4 gap-3">
			<Figure
				label="Saldo atual"
				value={quantity(product.onHand)}
				unit={product.unit}
				tone={product.belowMinimum ? "warn" : undefined}
			/>
			<Figure
				label="Estoque mínimo"
				value={quantity(product.minStock)}
				unit={product.unit}
			/>
			<Panel className="flex flex-col gap-1 px-4 py-3">
				<span className="text-[11.5px] text-muted">Situação</span>
				<Badge tone={situation.tone}>{situation.label}</Badge>
			</Panel>
			{/* Variability mechanism A: a clinic without the lot module has no such
			    concept, so the figure does not exist for it either. */}
			<ModuleGate requires={MODULE.batches}>
				<Panel className="flex flex-col gap-1 px-4 py-3">
					<span className="text-[11.5px] text-muted">Controle por lote</span>
					<span className="text-[13.5px] text-ink">
						{product.batchControlled ? "Sim" : "Não"}
					</span>
				</Panel>
			</ModuleGate>
		</div>
	);
}

type FigureProps = {
	label: string;
	value: string;
	unit?: string;
	tone?: "warn";
};

function Figure({ label, value, unit, tone }: FigureProps) {
	return (
		<Panel className="flex flex-col gap-1 px-4 py-3">
			<span className="text-[11.5px] text-muted">{label}</span>
			<span
				className={cn(
					"text-[19px] tabular-nums",
					tone === "warn" ? "font-semibold text-warn" : "text-ink",
				)}
			>
				{value}
				{unit ? (
					<span className="ml-1 text-[12.5px] text-faint">{unit}</span>
				) : null}
			</span>
		</Panel>
	);
}
