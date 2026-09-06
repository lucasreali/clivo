import { createFileRoute } from "@tanstack/react-router";
import { CustomerHistory } from "#/features/customers/components/CustomerHistory";

export const Route = createFileRoute("/_app/clientes/$customerId/historico")({
	component: CustomerHistoryPage,
});

function CustomerHistoryPage() {
	const { customerId } = Route.useParams();
	return <CustomerHistory customerId={Number(customerId)} />;
}
