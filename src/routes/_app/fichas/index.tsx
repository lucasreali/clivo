import { createFileRoute } from "@tanstack/react-router";
import { TemplateList } from "#/features/templates/components/TemplateList";

export const Route = createFileRoute("/_app/fichas/")({
	component: TemplateList,
});
