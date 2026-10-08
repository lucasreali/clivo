import { createFileRoute } from "@tanstack/react-router";
import { TemplateEditor } from "#/features/templates/components/TemplateEditor";

export const Route = createFileRoute("/_app/fichas/novo")({
	component: TemplateEditor,
});
