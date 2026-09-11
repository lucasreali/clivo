import { createFileRoute } from "@tanstack/react-router";
import { CustomerHistory } from "#/features/customers/components/CustomerHistory";

export const Route = createFileRoute("/_app/customers/$customerId/history")({
	component: CustomerHistoryPage,
});

function CustomerHistoryPage() {
	const { customerId } = Route.useParams();
	return <CustomerHistory customerId={customerId} />;
}
