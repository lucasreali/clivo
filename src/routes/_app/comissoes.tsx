import { createFileRoute } from "@tanstack/react-router";
import { ModuleRoute } from "#/features/capabilities/components/ModuleRoute";
import { MODULE } from "#/features/capabilities/model/module-code";
import { CommissionStatement } from "#/features/commissions/components/CommissionStatement";

export const Route = createFileRoute("/_app/comissoes")({
	component: CommissionsPage,
});

function CommissionsPage() {
	return (
		<ModuleRoute requires={MODULE.commissions} title="Comissões">
			<CommissionStatement />
		</ModuleRoute>
	);
}
