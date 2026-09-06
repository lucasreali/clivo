import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "#/features/settings/components/Settings";

export const Route = createFileRoute("/_app/configuracoes")({
	component: Settings,
});
