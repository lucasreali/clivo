import { createFileRoute } from "@tanstack/react-router";
import { ModuleRoute } from "#/features/capabilities/components/ModuleRoute";
import { MODULE } from "#/features/capabilities/model/module-code";
import { ProductDetail } from "#/features/inventory/components/ProductDetail";

export const Route = createFileRoute("/_app/estoque/$productId")({
	component: ProductPage,
});

function ProductPage() {
	const { productId } = Route.useParams();

	return (
		<ModuleRoute requires={MODULE.inventory} title="Estoque">
			<ProductDetail productId={productId} />
		</ModuleRoute>
	);
}
