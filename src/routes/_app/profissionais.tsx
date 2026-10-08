import { createFileRoute } from "@tanstack/react-router";
import { PractitionerList } from "#/features/practitioners/components/PractitionerList";

export const Route = createFileRoute("/_app/profissionais")({
	component: PractitionerList,
});
