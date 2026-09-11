import { useGetCurrentSession } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { manages } from "../model/role";
import { ParametersPanel } from "./ParametersPanel";
import { TeamPanel } from "./TeamPanel";

export function Settings() {
	const session = useGetCurrentSession();
	const isManager = manages(session.data?.role);

	return (
		<>
			<AppTopBar
				title="Clinic settings"
				meta={isManager ? "Unit parameters and team access" : "Unit parameters"}
			/>

			<Page>
				<ParametersPanel />
				{isManager ? <TeamPanel /> : null}
			</Page>
		</>
	);
}
