import { Link } from "@tanstack/react-router";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { Button } from "#/shared/ui/Button";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel } from "#/shared/ui/Panel";
import { useCapabilities } from "../hooks/use-capabilities";
import type { ModuleCode } from "../model/module-code";

type ModuleRouteProps = {
	requires: ModuleCode | readonly ModuleCode[];
	title: string;
	children: React.ReactNode;
};

/**
 * Variability mechanism A, applied to a whole screen. Hiding the sidebar entry
 * is cosmetic — the address still resolves — so a screen that belongs to a
 * module says so itself. The API answers 404 to the same request, and this is
 * that answer with a face on it.
 */
export function ModuleRoute({ requires, title, children }: ModuleRouteProps) {
	const { capabilities, isPending } = useCapabilities();
	const codes = Array.isArray(requires) ? requires : [requires as ModuleCode];

	// Rendering nothing while the capabilities load flashes a blank screen, and
	// rendering the children would flash a screen this clinic may not have.
	if (isPending) {
		return <Loading title={title} />;
	}

	if (!capabilities.modules.reachesAll(codes)) {
		return <ModuleNotContracted title={title} />;
	}

	return <>{children}</>;
}

function Loading({ title }: { title: string }) {
	return (
		<>
			<AppTopBar title={title} />
			<Page>
				<Panel>
					<p className="m-0 px-4 py-10 text-center text-[12.5px] text-muted">
						Carregando…
					</p>
				</Panel>
			</Page>
		</>
	);
}

function ModuleNotContracted({ title }: { title: string }) {
	return (
		<>
			<AppTopBar title={title} meta="Módulo não contratado" />
			<Page>
				<Panel>
					<EmptyState
						title={`${title} não faz parte do plano desta clínica`}
						description="Este módulo é opcional e não está disponível para você — ou a clínica não o contratou, ou o seu acesso a ele não foi concedido. Fale com a gestão da clínica."
						actions={
							<Link to="/">
								<Button variant="secondary">Voltar ao painel do dia</Button>
							</Link>
						}
					/>
				</Panel>
			</Page>
		</>
	);
}
