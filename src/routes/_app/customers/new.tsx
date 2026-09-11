import { createFileRoute } from "@tanstack/react-router";
import { NewCustomer } from "#/features/customers/components/NewCustomer";

export const Route = createFileRoute("/_app/customers/new")({
	component: NewCustomer,
});
