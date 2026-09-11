import { Warning } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useListExpiringBatches } from "#/api/gen/hooks";
import type { BatchView } from "#/api/gen/types";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
import { shortDay } from "#/shared/format/date";
import { quantity } from "#/shared/format/number";
import { Badge } from "#/shared/ui/Badge";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

/**
 * Variability mechanism A: the expiry watch belongs to the lot module, and the
 * window it looks ahead is the clinic's own `expiry_alert_days` parameter —
 * left to the API rather than restated here.
 */
export function ExpiringBatches() {
	return (
		<ModuleGate requires={MODULE.batches}>
			<ExpiringPanel />
		</ModuleGate>
	);
}

function ExpiringPanel() {
	const batches = useListExpiringBatches({});
	const rows = batches.data ?? [];

	if (batches.isPending || rows.length === 0) {
		return null;
	}

	return (
		<Panel>
			<PanelHeader
				title="Lotes perto do vencimento"
				hint={`${rows.length} ${rows.length === 1 ? "lote entra" : "lotes entram"} na janela de alerta da clínica.`}
				actions={<Warning size={16} className="text-warn" aria-hidden="true" />}
			/>
			<ul className="flex flex-col">
				{rows.map((batch) => (
					<ExpiringRow key={String(batch.id)} batch={batch} />
				))}
			</ul>
		</Panel>
	);
}

function ExpiringRow({ batch }: { batch: BatchView }) {
	return (
		<li className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
			<Link
				to="/estoque/$productId"
				params={{ productId: String(batch.productId) }}
				className="min-w-0 flex-1 truncate text-[13px] text-brand hover:text-brand-ink"
			>
				{batch.productName ?? "Produto"}
			</Link>
			<span className="text-[12.5px] text-muted">Lote {batch.code}</span>
			<span className="text-[12.5px] text-muted tabular-nums">
				{quantity(batch.quantity)}
			</span>
			<Badge tone={batch.expired ? "danger" : "warn"}>
				{batch.expired ? "Vencido" : "Vence"} em {shortDay(batch.expiresOn)}
			</Badge>
		</li>
	);
}
