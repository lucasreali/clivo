import { createFileRoute } from "@tanstack/react-router";
import { Administrators } from "#/features/platform/components/Administrators";

export const Route = createFileRoute("/console/_console/administrators")({
	component: Administrators,
});
