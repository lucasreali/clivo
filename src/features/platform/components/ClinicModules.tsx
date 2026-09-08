import { useState } from "react";
import type { PlatformModuleView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { messageOf } from "#/shared/api-error";
import { dateTimeLabel } from "#/shared/format/date";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicModules } from "../hooks/use-clinic-modules";
import type { ModuleCatalog } from "../model/module-catalog";
import { describeModuleChange } from "../model/module-change";
import { decisionOn, type ModuleDecision } from "../model/module-decision";
import { ClinicLifecycleActions } from "./ClinicLifecycleActions";
import { ClinicTopBar } from "./ClinicTopBar";
import { ModuleDecisionDialog } from "./ModuleDecisionDialog";

const column = columnsFor<PlatformModuleView>();

function columnsToggling(
	catalog: ModuleCatalog,
	isSaving: boolean,
	onToggle: (module: PlatformModuleView) => void,
) {
	return column.columns([
		column.accessor("name", {
			header: "Módulo",
			meta: { width: "25%" },
			cell: ({ row }) => <ModuleName module={row.original} />,
		}),
		column.accessor("description", {
			header: "Efeito na clínica",
			cell: ({ row }) => (
				<ModuleEffect module={row.original} catalog={catalog} />
			),
		}),
		column.accessor("active", {
			header: "Situação",
			meta: { width: "150px" },
			cell: ({ getValue }) => (
				<Badge tone={getValue() ? "brand" : "neutral"}>
					{getValue() ? "Ativo" : "Desligado"}
				</Badge>
			),
		}),
		column.display({
			id: "actions",
			meta: { width: "120px", align: "right" },
			cell: ({ row }) => (
				<Button
					variant="ghost"
					onClick={() => onToggle(row.original)}
					disabled={isSaving}
				>
					{row.original.active ? "Desligar" : "Ligar"}
				</Button>
			),
		}),
	]);
}

export function ClinicModules({ tenantId }: { tenantId: string }) {
	const [decision, setDecision] = useState<ModuleDecision>();
	const modules = useClinicModules(tenantId);
	const { catalog } = modules;

	function toggle(module: PlatformModuleView) {
		const pending = decisionOn(catalog, module);
		if (pending) {
			setDecision(pending);
			return;
		}

		modules.activate(module.code ?? "");
	}

	const columns = columnsToggling(catalog, modules.isSaving, toggle);

	return (
		<>
			<ClinicTopBar
				tenantId={tenantId}
				section="módulos"
				meta={`${catalog.activeCount()} de ${catalog.total()} módulos`}
				actions={<ClinicLifecycleActions tenantId={tenantId} />}
			/>

			<Page>
				<div className="grid grid-cols-[1.9fr_1fr] items-start gap-4">
					<Panel>
						<PanelHeader
							title="Catálogo da plataforma"
							hint="Neste console o catálogo inteiro aparece sempre: o que está desligado é informação, não ruído."
						/>

						<DataTable
							columns={columns}
							rows={catalog.listed()}
							rowId={(module) => module.code ?? ""}
							isPending={modules.isPending}
							pendingLabel="Carregando módulos…"
							empty={
								<EmptyState
									title="Nenhum módulo no catálogo"
									description="A plataforma ainda não publicou nenhum módulo para esta instância."
								/>
							}
						/>

						{modules.error ? (
							<div className="p-4">
								<Callout tone="danger">{messageOf(modules.error)}</Callout>
							</div>
						) : null}
					</Panel>

					<Panel>
						<PanelHeader
							title="Histórico de ativações"
							hint="Toda mudança de módulo fica registrada."
						/>

						{modules.history.length === 0 ? (
							<EmptyState
								title="Nenhuma mudança registrada"
								description="Ligar ou desligar um módulo cria a primeira linha deste registro."
							/>
						) : null}

						{modules.history.map((change) => (
							<div
								key={`${change.code}-${change.changedAt}`}
								className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
							>
								<div className="flex min-w-0 flex-col">
									<span className="truncate text-[13px] font-medium text-ink">
										{catalog.nameOf(change.code)}
									</span>
									<span className="text-[11.5px] text-muted">
										{dateTimeLabel(change.changedAt)}
									</span>
								</div>
								<span className="ml-auto">
									<Badge tone={describeModuleChange(change.action).tone}>
										{describeModuleChange(change.action).label}
									</Badge>
								</span>
							</div>
						))}
					</Panel>
				</div>
			</Page>

			{decision ? (
				<ModuleDecisionDialog
					decision={decision}
					isSaving={modules.isSaving}
					onClose={() => setDecision(undefined)}
					onActivate={modules.activate}
					onDeactivate={modules.deactivate}
				/>
			) : null}
		</>
	);
}

function ModuleName({ module }: { module: PlatformModuleView }) {
	return (
		<div className="flex min-w-0 flex-col">
			<span className="truncate font-medium text-ink">{module.name}</span>
			<span className="font-mono text-[11.5px] text-muted">{module.code}</span>
		</div>
	);
}

type ModuleEffectProps = {
	module: PlatformModuleView;
	catalog: ModuleCatalog;
};

function ModuleEffect({ module, catalog }: ModuleEffectProps) {
	const missing = catalog.missingDependencyOf(module);

	return (
		<div className="flex min-w-0 flex-col">
			<span className="text-[12.5px] leading-relaxed text-muted">
				{module.description}
			</span>
			{missing ? (
				<span className="text-[11.5px] text-warn-ink">
					Depende de {missing.name}, que está desligado.
				</span>
			) : null}
		</div>
	);
}
