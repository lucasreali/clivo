import { createFileRoute } from "@tanstack/react-router";
import { ClinicParameters } from "#/features/platform/components/ClinicParameters";

export const Route = createFileRoute(
	"/console/_console/clinics/$tenantId/parameters",
)({
	component: ClinicParametersPage,
});

function ClinicParametersPage() {
	const { tenantId } = Route.useParams();
	return <ClinicParameters tenantId={tenantId} />;
}
