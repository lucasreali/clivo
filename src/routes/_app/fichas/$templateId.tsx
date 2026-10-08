import { createFileRoute } from "@tanstack/react-router";
import { TemplateEditor } from "#/features/templates/components/TemplateEditor";

export const Route = createFileRoute("/_app/fichas/$templateId")({
	component: TemplatePage,
});

function TemplatePage() {
	const { templateId } = Route.useParams();

	return <TemplateEditor templateId={templateId} />;
}
