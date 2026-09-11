import { createFileRoute } from "@tanstack/react-router";
import { ModuleRoute } from "#/features/capabilities/components/ModuleRoute";
import { MODULE } from "#/features/capabilities/model/module-code";
import { InventoryList } from "#/features/inventory/components/InventoryList";

export const Route = createFileRoute("/_app/estoque/")({
	component: InventoryPage,
});

function InventoryPage() {
	return (
		<ModuleRoute requires={MODULE.inventory} title="Estoque">
			<InventoryList />
		</ModuleRoute>
	);
}
