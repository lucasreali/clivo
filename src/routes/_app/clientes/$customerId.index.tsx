import { createFileRoute } from "@tanstack/react-router";
import { CustomerDetail } from "#/features/customers/components/CustomerDetail";

export const Route = createFileRoute("/_app/clientes/$customerId/")({
	component: CustomerDetailPage,
});

function CustomerDetailPage() {
	const { customerId } = Route.useParams();
	return <CustomerDetail customerId={customerId} />;
}
