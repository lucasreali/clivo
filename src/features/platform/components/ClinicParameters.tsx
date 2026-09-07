import { useState } from "react";
import { Page } from "#/features/navigation/components/AppShell";
import { ParameterControl } from "#/features/settings/components/ParameterControl";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicParameters } from "../hooks/use-clinic-parameters";
import { ClinicTopBar } from "./ClinicTopBar";

const COLUMNS = "grid-cols-[1.7fr_150px_1fr]";

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

					<div
						className={`grid ${COLUMNS} gap-4 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase`}
					>
						<span>Parâmetro e valor</span>
						<span>Código</span>
						<span>Valor vigente</span>
					</div>

					{parameters.isPending ? (
						<p className="px-4 py-10 text-center text-[12.5px] text-muted">
							Carregando parâmetros…
						</p>
					) : null}

					{!parameters.isPending && parameters.parameters.length === 0 ? (
						<EmptyState
							title="Nenhum parâmetro em vigor"
							description="Parâmetro que depende de módulo inativo não aparece aqui. Ligue o módulo correspondente para trazer as linhas de volta com os valores anteriores."
						/>
					) : null}

					{parameters.parameters.map((parameter) => {
						const code = parameter.code ?? "";

						return (
							<div
								key={code}
								className={`grid ${COLUMNS} items-start gap-4 border-b border-line px-4 py-4 last:border-b-0`}
							>
								<ParameterControl
									parameter={parameter}
									value={edited[code] ?? parameter.value ?? ""}
									onChange={(value) => setEdited({ ...edited, [code]: value })}
								/>
								<span className="pt-1.5 font-mono text-[12px] text-muted">
									{code}
								</span>
								<span className="pt-1.5 text-[12.5px] text-muted">
									{parameter.value ?? "—"}
								</span>
							</div>
						);
					})}

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
