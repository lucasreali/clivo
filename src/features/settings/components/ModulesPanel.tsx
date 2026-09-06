import { useQueryClient } from "@tanstack/react-query";
import {
	useActivateModule,
	useDeactivateModule,
	useListModules,
} from "#/api/gen/hooks";
import type { ModuleView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

export function ModulesPanel() {
	const queryClient = useQueryClient();
	const refresh = () => queryClient.invalidateQueries();

	const modules = useListModules();
	const activate = useActivateModule({ mutation: { onSuccess: refresh } });
	const deactivate = useDeactivateModule({ mutation: { onSuccess: refresh } });

	const available = modules.data ?? [];
	const isBlocked = (module: ModuleView) =>
		Boolean(module.requiresModule) &&
		!available.some(
			(other) => other.code === module.requiresModule && other.active,
		);

	return (
		<Panel>
			<PanelHeader
				title="Catálogo de módulos"
				hint="Desligar um módulo remove o item do menu e os campos das telas desta clínica."
			/>

			<div className="grid grid-cols-[120px_1.2fr_2fr_140px_140px] gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase">
				<span>Código</span>
				<span>Módulo</span>
				<span>Efeito na interface</span>
				<span>Dependência</span>
				<span />
			</div>

			{available.map((module) => {
				const blocked = isBlocked(module);
				const code = module.code ?? "";

				return (
					<div
						key={code}
						className="grid grid-cols-[120px_1.2fr_2fr_140px_140px] items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0"
					>
						<span className="font-mono text-[12px] text-muted">{code}</span>
						<span className="font-medium text-ink">{module.name}</span>
						<span className="text-[12.5px] text-muted">
							{module.description}
						</span>
						<span className="text-[12px] text-faint">
							{module.requiresModule ?? "—"}
						</span>
						<div className="flex items-center justify-end gap-2">
							<Badge tone={module.active ? "brand" : "neutral"}>
								{module.active ? "Ativo" : "Inativo"}
							</Badge>
							<Button
								variant="ghost"
								disabled={blocked || activate.isPending || deactivate.isPending}
								onClick={() =>
									module.active
										? deactivate.mutate({ path: { code } })
										: activate.mutate({ path: { code } })
								}
							>
								{module.active ? "Desligar" : "Ligar"}
							</Button>
						</div>
					</div>
				);
			})}

			{activate.isError || deactivate.isError ? (
				<div className="p-4">
					<Callout tone="danger">
						{messageOf(activate.error ?? deactivate.error)}
					</Callout>
				</div>
			) : null}
		</Panel>
	);
}
