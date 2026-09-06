import { createFileRoute } from "@tanstack/react-router";
import { CustomerList } from "#/features/customers/components/CustomerList";

export const Route = createFileRoute("/_app/clientes/")({
	component: CustomerList,
});
