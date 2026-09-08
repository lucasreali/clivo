import { useState } from "react";
import type { UserView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { Select } from "#/shared/ui/Select";
import { useTeam } from "../hooks/use-team";
import { labelOfRole, manages, Roles } from "../model/role";
import { UserAccess } from "./UserAccess";

const column = columnsFor<UserView>();

type TeamActions = {
	isSaving: boolean;
	onOpen: (user: UserView) => void;
	onChangeRole: ReturnType<typeof useTeam>["changeRole"];
	onDeactivate: ReturnType<typeof useTeam>["deactivate"];
};

function columnsManaging({
	isSaving,
	onOpen,
	onChangeRole,
	onDeactivate,
}: TeamActions) {
	return column.columns([
		column.accessor("name", {
			header: "Pessoa",
			cell: ({ row }) => <Person user={row.original} />,
		}),
		column.accessor("role", {
			header: "Perfil",
			meta: { width: "170px" },
			cell: ({ row }) => (
				<Select
					value={row.original.role ?? ""}
					disabled={!row.original.active || isSaving}
					aria-label={`Perfil de ${row.original.name}`}
					className="h-[32px]"
					options={Roles.assignableByManager().map((option) => ({
						value: option.role,
						label: option.label,
					}))}
					onChange={(role) =>
						onChangeRole(
							row.original.id ?? "",
							role as Parameters<typeof onChangeRole>[1],
						)
					}
				/>
			),
		}),
		column.accessor("active", {
			header: "Situação",
			meta: { width: "110px" },
			cell: ({ getValue }) => (
				<Badge tone={getValue() ? "brand" : "neutral"}>
					{getValue() ? "Ativo" : "Inativo"}
				</Badge>
			),
		}),
		column.display({
			id: "actions",
			meta: { width: "180px", align: "right" },
			cell: ({ row }) => (
				<div className="flex justify-end gap-1.5">
					<Button variant="ghost" onClick={() => onOpen(row.original)}>
						Acessos
					</Button>
					<Button
						variant="ghost"
						disabled={!row.original.active || isSaving}
						onClick={() => onDeactivate(row.original.id ?? "")}
					>
						Inativar
					</Button>
				</div>
			),
		}),
	]);
}

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

				<DataTable
					columns={columnsManaging({
						isSaving: team.isSaving,
						onOpen: (user) => setOpened(user.id),
						onChangeRole: team.changeRole,
						onDeactivate: team.deactivate,
					})}
					rows={team.users}
					rowId={(user) => user.id ?? ""}
					isPending={team.isPending}
					pendingLabel="Carregando equipe…"
					highlighted={(user) => user.id === opened}
					empty={
						<EmptyState
							title="Nenhum usuário nesta clínica"
							description="O cadastro de usuários ainda não tem tela: use a API para criar a primeira conta."
						/>
					}
				/>

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

function Person({ user }: { user: UserView }) {
	return (
		<div className="flex min-w-0 flex-col">
			<span className="truncate font-medium text-ink">{user.name}</span>
			<span className="truncate text-[11.5px] text-muted">{user.email}</span>
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
