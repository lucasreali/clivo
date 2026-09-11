import { useState } from "react";
import type { ParameterView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { ParameterControl } from "#/features/settings/components/ParameterControl";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicParameters } from "../hooks/use-clinic-parameters";
import { ClinicTopBar } from "./ClinicTopBar";

const column = columnsFor<ParameterView>();

function columnsEditing(
	edited: Record<string, string>,
	onEdit: (code: string, value: string) => void,
) {
	return column.columns([
		column.display({
			id: "control",
			header: "Parameter and value",
			cell: ({ row }) => (
				<ParameterControl
					parameter={row.original}
					value={edited[row.original.code ?? ""] ?? row.original.value ?? ""}
					onChange={(value) => onEdit(row.original.code ?? "", value)}
				/>
			),
		}),
		column.accessor("code", {
			header: "Code",
			meta: { width: "150px" },
			cell: ({ getValue }) => (
				<span className="block pt-1.5 font-mono text-[12px] text-muted">
					{getValue()}
				</span>
			),
		}),
		column.accessor("value", {
			header: "Current value",
			meta: { width: "25%" },
			cell: ({ getValue }) => (
				<span className="block pt-1.5 text-[12.5px] text-muted">
					{getValue() ?? "—"}
				</span>
			),
		}),
	]);
}

export function ClinicParameters({ tenantId }: { tenantId: string }) {
	const [edited, setEdited] = useState<Record<string, string>>({});
	const parameters = useClinicParameters(tenantId);

	const pending = Object.entries(edited);

	async function saveAll() {
		for (const [code, value] of pending) {
			await parameters.change({ code, value });
		}
		setEdited({});
	}

	return (
		<>
			<ClinicTopBar
				tenantId={tenantId}
				section="parameters"
				meta={`${parameters.parameters.length} in force`}
				actions={
					<Button
						onClick={saveAll}
						disabled={pending.length === 0 || parameters.isSaving}
					>
						{parameters.isSaving ? "Saving…" : "Save changes"}
					</Button>
				}
			/>

			<Page>
				<Panel>
					<PanelHeader
						title="Parameters of this clinic"
						hint="The rule exists in every clinic; the value belongs to this unit."
					/>

					<DataTable
						columns={columnsEditing(edited, (code, value) =>
							setEdited({ ...edited, [code]: value }),
						)}
						rows={parameters.parameters}
						rowId={(parameter) => parameter.code ?? ""}
						isPending={parameters.isPending}
						pendingLabel="Loading parameters…"
						verticalAlign="top"
						empty={
							<EmptyState
								title="No parameter in force"
								description="A parameter that depends on an inactive module does not show up here. Turn the matching module on to bring the rows back with their previous values."
							/>
						}
					/>

					<div className="border-t border-line px-4 py-3">
						<Callout tone="neutral">
							A parameter that depends on an inactive module is not rendered —
							not greyed out, not flagged. Turning the module on under Modules
							brings the row back with its previous value.
						</Callout>
					</div>

					{parameters.error ? (
						<div className="px-4 pb-4">
							<Callout tone="danger">{messageOf(parameters.error)}</Callout>
						</div>
					) : null}
				</Panel>
			</Page>
		</>
	);
}
