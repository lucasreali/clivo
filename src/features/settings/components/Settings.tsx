import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { ModulesPanel } from "./ModulesPanel";
import { ParametersPanel } from "./ParametersPanel";

export function Settings() {
	return (
		<>
			<TopBar
				title="Configurações da clínica"
				meta="Módulos contratados e parâmetros da unidade"
			/>

			<Page>
				<ParametersPanel />
				<ModulesPanel />
			</Page>
		</>
	);
}
