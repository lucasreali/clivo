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
			header: "Person",
			cell: ({ row }) => <Person user={row.original} />,
		}),
		column.accessor("role", {
			header: "Role",
			meta: { width: "170px" },
			cell: ({ row }) => (
				<Select
					value={row.original.role ?? ""}
					disabled={!row.original.active || isSaving}
					aria-label={`Role of ${row.original.name}`}
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
			header: "Status",
			meta: { width: "110px" },
			cell: ({ getValue }) => (
				<Badge tone={getValue() ? "brand" : "neutral"}>
					{getValue() ? "Active" : "Inactive"}
				</Badge>
			),
		}),
		column.display({
			id: "actions",
			meta: { width: "180px", align: "right" },
			cell: ({ row }) => (
				<div className="flex justify-end gap-1.5">
					<Button variant="ghost" onClick={() => onOpen(row.original)}>
						Access
					</Button>
					<Button
						variant="ghost"
						disabled={!row.original.active || isSaving}
						onClick={() => onDeactivate(row.original.id ?? "")}
					>
						Deactivate
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
					title="Clinic team"
					hint="The role defines what a person may do; the modules define what they reach."
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
					pendingLabel="Loading team…"
					highlighted={(user) => user.id === opened}
					empty={
						<EmptyState
							title="No users in this clinic"
							description="User registration has no screen yet: use the API to create the first account."
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
					title="Access per person"
					hint="Pick someone from the team to grant or revoke modules."
				/>
				<EmptyState
					title="No person selected"
					description="Each module the clinic contracted only shows up for whoever was granted access. Managers reach all of them."
				/>
			</Panel>
		);
	}

	if (manages(user.role)) {
		return (
			<Panel>
				<PanelHeader title={`Access of ${user.name}`} />
				<div className="p-5">
					<Callout tone="info" title={labelOfRole(user.role)}>
						Whoever manages the clinic reaches every contracted module. To limit
						that access, change the role first.
					</Callout>
				</div>
			</Panel>
		);
	}

	return <UserAccess user={user} />;
}
