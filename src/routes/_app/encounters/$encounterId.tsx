import { createFileRoute } from "@tanstack/react-router";
import { EncounterRecord } from "#/features/encounters/components/EncounterRecord";

export const Route = createFileRoute("/_app/encounters/$encounterId")({
	component: EncounterPage,
});

function EncounterPage() {
	const { encounterId } = Route.useParams();
	return <EncounterRecord encounterId={encounterId} />;
}
