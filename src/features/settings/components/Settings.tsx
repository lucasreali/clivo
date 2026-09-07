import { useGetCurrentSession } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { manages } from "../model/role";
import { ParametersPanel } from "./ParametersPanel";
import { TeamPanel } from "./TeamPanel";

export function Settings() {
	const session = useGetCurrentSession();
	const isManager = manages(session.data?.role);

	return (
		<>
			<TopBar
				title="Configurações da clínica"
				meta={
					isManager
						? "Parâmetros da unidade e acessos da equipe"
						: "Parâmetros da unidade"
				}
			/>

			<Page>
				<ParametersPanel />
				{isManager ? <TeamPanel /> : null}
			</Page>
		</>
	);
}
