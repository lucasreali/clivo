import { useState } from "react";
import type { UserView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Select } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useTeam } from "../hooks/use-team";
import { labelOfRole, manages, Roles } from "../model/role";
import { UserAccess } from "./UserAccess";

const COLUMNS = "grid-cols-[1.6fr_170px_110px_180px]";

export function TeamPanel() {
	const [opened, setOpened] = useState<string>();
	const team = useTeam();

	return (
		<div className="grid grid-cols-[1.9fr_1fr] items-start gap-4">
			<Panel>
				<PanelHeader
					title="Equipe da clínica"
					hint="O perfil define o que a pessoa pode fazer; os módulos definem o que ela alcança."
				/>

				<div
					className={`grid ${COLUMNS} gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase`}
				>
					<span>Pessoa</span>
					<span>Perfil</span>
					<span>Situação</span>
					<span />
				</div>

				{team.isPending ? (
					<p className="px-4 py-10 text-center text-[12.5px] text-muted">
						Carregando equipe…
					</p>
				) : null}

				{!team.isPending && team.users.length === 0 ? (
					<EmptyState
						title="Nenhum usuário nesta clínica"
						description="O cadastro de usuários ainda não tem tela: use a API para criar a primeira conta."
					/>
				) : null}

				{team.users.map((user) => (
					<TeamRow
						key={user.id}
						user={user}
						isSaving={team.isSaving}
						isOpened={opened === user.id}
						onOpen={() => setOpened(user.id)}
						onChangeRole={team.changeRole}
						onDeactivate={team.deactivate}
					/>
				))}

				{team.error ? (
					<div className="p-4">
						<Callout tone="danger">{messageOf(team.error)}</Callout>
					</div>
				) : null}
			</Panel>

			<OpenedUser user={team.users.find((user) => user.id === opened)} />
		</div>
	);
}

type TeamRowProps = {
	user: UserView;
	isSaving: boolean;
	isOpened: boolean;
	onOpen: () => void;
	onChangeRole: ReturnType<typeof useTeam>["changeRole"];
	onDeactivate: ReturnType<typeof useTeam>["deactivate"];
};

function TeamRow({
	user,
	isSaving,
	isOpened,
	onOpen,
	onChangeRole,
	onDeactivate,
}: TeamRowProps) {
	const userId = user.id ?? "";

	return (
		<div
			className={`grid ${COLUMNS} items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0 ${
				isOpened ? "bg-brand-soft/30" : ""
			}`}
		>
			<div className="flex min-w-0 flex-col">
				<span className="truncate font-medium text-ink">{user.name}</span>
				<span className="truncate text-[11.5px] text-muted">{user.email}</span>
			</div>

			<Select
				value={user.role ?? ""}
				disabled={!user.active || isSaving}
				aria-label={`Perfil de ${user.name}`}
				className="h-[32px]"
				onChange={(event) =>
					onChangeRole(
						userId,
						event.target.value as Parameters<typeof onChangeRole>[1],
					)
				}
			>
				{Roles.assignableByManager().map((option) => (
					<option key={option.role} value={option.role}>
						{option.label}
					</option>
				))}
			</Select>

			<Badge tone={user.active ? "brand" : "neutral"}>
				{user.active ? "Ativo" : "Inativo"}
			</Badge>

			<div className="flex justify-end gap-1.5">
				<Button variant="ghost" onClick={onOpen}>
					Acessos
				</Button>
				<Button
					variant="ghost"
					disabled={!user.active || isSaving}
					onClick={() => onDeactivate(userId)}
				>
					Inativar
				</Button>
			</div>
		</div>
	);
}

function OpenedUser({ user }: { user: UserView | undefined }) {
	if (!user) {
		return (
			<Panel>
				<PanelHeader
					title="Acessos por pessoa"
					hint="Escolha alguém da equipe para liberar ou retirar módulos."
				/>
				<EmptyState
					title="Nenhuma pessoa selecionada"
					description="Cada módulo contratado pela clínica só aparece para quem recebeu acesso. Quem gerencia alcança todos."
				/>
			</Panel>
		);
	}

	if (manages(user.role)) {
		return (
			<Panel>
				<PanelHeader title={`Acessos de ${user.name}`} />
				<div className="p-5">
					<Callout tone="info" title={labelOfRole(user.role)}>
						Quem gerencia a clínica alcança todos os módulos contratados. Para
						limitar o acesso, mude o perfil antes.
					</Callout>
				</div>
			</Panel>
		);
	}

	return <UserAccess user={user} />;
}
