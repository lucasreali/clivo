import { createFileRoute } from "@tanstack/react-router";
import { EncounterRecord } from "#/features/encounters/components/EncounterRecord";

export const Route = createFileRoute("/_app/atendimentos/$encounterId")({
	component: EncounterPage,
});

function EncounterPage() {
	const { encounterId } = Route.useParams();
	return <EncounterRecord encounterId={encounterId} />;
}
