import { createFileRoute } from "@tanstack/react-router";
import { ClinicList } from "#/features/platform/components/ClinicList";

export const Route = createFileRoute("/console/_console/")({
	component: ClinicList,
});
