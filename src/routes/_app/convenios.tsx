import { createFileRoute } from "@tanstack/react-router";
import { ModuleRoute } from "#/features/capabilities/components/ModuleRoute";
import { MODULE } from "#/features/capabilities/model/module-code";
import { PlanList } from "#/features/insurance/components/PlanList";

export const Route = createFileRoute("/_app/convenios")({
	component: InsurancePage,
});

function InsurancePage() {
	return (
		<ModuleRoute requires={MODULE.insurance} title="Convênios">
			<PlanList />
		</ModuleRoute>
	);
}
