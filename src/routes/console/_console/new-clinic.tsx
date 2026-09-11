import { createFileRoute } from "@tanstack/react-router";
import { NewClinic } from "#/features/platform/components/NewClinic";

export const Route = createFileRoute("/console/_console/new-clinic")({
	component: NewClinic,
});
