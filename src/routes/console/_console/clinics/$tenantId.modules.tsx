import { createFileRoute } from "@tanstack/react-router";
import { ClinicModules } from "#/features/platform/components/ClinicModules";

export const Route = createFileRoute(
	"/console/_console/clinics/$tenantId/modules",
)({
	component: ClinicModulesPage,
});

function ClinicModulesPage() {
	const { tenantId } = Route.useParams();
	return <ClinicModules tenantId={tenantId} />;
}
