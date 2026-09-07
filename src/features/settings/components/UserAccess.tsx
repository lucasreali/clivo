import { useListUserModules } from "#/api/gen/hooks";
import type { UserView } from "#/api/gen/types";
import { useCapabilities } from "#/features/capabilities/hooks/use-capabilities";
import { messageOf } from "#/shared/api-error";
import { Callout } from "#/shared/ui/Callout";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Checkbox } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useUserModules } from "../hooks/use-team";

export function UserAccess({ user }: { user: UserView }) {
	const userId = user.id ?? "";
	const { capabilities } = useCapabilities();
	const granted = useListUserModules({ path: { userId } });
	const access = useUserModules(userId);

	const contracted = capabilities.modules;
	const reached = granted.data ?? [];

	return (
		<Panel>
			<PanelHeader
				title={`Acessos de ${user.name}`}
				hint="Somente os módulos contratados pela clínica podem ser liberados."
			/>

			{contracted.isEmpty() ? (
				<EmptyState
					title="Nenhum módulo contratado"
					description="Esta clínica opera apenas com o núcleo. A contratação de módulos é feita pela equipe Clivo."
				/>
			) : null}

			<div className="flex flex-col gap-3 p-5">
				{contracted.map((module) => (
					<Checkbox
						key={module.code}
						checked={reached.includes(module.code ?? "")}
						disabled={access.isSaving || granted.isPending}
						label={module.name ?? module.code}
						onChange={(event) =>
							event.target.checked
								? access.grant(module.code ?? "")
								: access.revoke(module.code ?? "")
						}
					/>
				))}
			</div>

			{access.error ? (
				<div className="px-5 pb-5">
					<Callout tone="danger">{messageOf(access.error)}</Callout>
				</div>
			) : null}
		</Panel>
	);
}
