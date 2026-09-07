import { createFileRoute } from "@tanstack/react-router";
import { NewClinic } from "#/features/platform/components/NewClinic";

export const Route = createFileRoute("/console/_console/nova-clinica")({
	component: NewClinic,
});
