import { createFileRoute } from "@tanstack/react-router";
import { ServiceList } from "#/features/services/components/ServiceList";

export const Route = createFileRoute("/_app/servicos")({
	component: ServiceList,
});
