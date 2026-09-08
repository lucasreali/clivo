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
			header: "Parâmetro e valor",
			cell: ({ row }) => (
				<ParameterControl
					parameter={row.original}
					value={edited[row.original.code ?? ""] ?? row.original.value ?? ""}
					onChange={(value) => onEdit(row.original.code ?? "", value)}
				/>
			),
		}),
		column.accessor("code", {
			header: "Código",
			meta: { width: "150px" },
			cell: ({ getValue }) => (
				<span className="block pt-1.5 font-mono text-[12px] text-muted">
					{getValue()}
				</span>
			),
		}),
		column.accessor("value", {
			header: "Valor vigente",
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
				section="parâmetros"
				meta={`${parameters.parameters.length} em vigor`}
				actions={
					<Button
						onClick={saveAll}
						disabled={pending.length === 0 || parameters.isSaving}
					>
						{parameters.isSaving ? "Salvando…" : "Salvar alterações"}
					</Button>
				}
			/>

			<Page>
				<Panel>
					<PanelHeader
						title="Parâmetros desta clínica"
						hint="A regra existe em todas as clínicas; o valor é desta unidade."
					/>

					<DataTable
						columns={columnsEditing(edited, (code, value) =>
							setEdited({ ...edited, [code]: value }),
						)}
						rows={parameters.parameters}
						rowId={(parameter) => parameter.code ?? ""}
						isPending={parameters.isPending}
						pendingLabel="Carregando parâmetros…"
						verticalAlign="top"
						empty={
							<EmptyState
								title="Nenhum parâmetro em vigor"
								description="Parâmetro que depende de módulo inativo não aparece aqui. Ligue o módulo correspondente para trazer as linhas de volta com os valores anteriores."
							/>
						}
					/>

					<div className="border-t border-line px-4 py-3">
						<Callout tone="neutral">
							Parâmetro que depende de módulo inativo não é renderizado — nem
							cinza, nem com aviso. Ligar o módulo em Módulos traz a linha de
							volta com o valor anterior.
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
