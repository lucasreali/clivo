import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useChangeParameter, useListParameters } from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { ParameterControl } from "./ParameterControl";

export function ParametersPanel() {
	const [edited, setEdited] = useState<Record<string, string>>({});
	const queryClient = useQueryClient();

	const parameters = useListParameters();
	const change = useChangeParameter({
		mutation: {
			onSuccess: async () => {
				await queryClient.invalidateQueries();
			},
		},
	});

	async function saveAll() {
		for (const [code, value] of Object.entries(edited)) {
			await change.mutateAsync({ path: { code }, body: { value } });
		}
		setEdited({});
	}

	return (
		<Panel>
			<PanelHeader
				title="Parâmetros da clínica"
				hint="A regra existe em todas as clínicas; o valor é desta unidade."
				actions={
					<Button
						onClick={saveAll}
						disabled={Object.keys(edited).length === 0 || change.isPending}
					>
						Salvar parâmetros
					</Button>
				}
			/>

			<div className="grid grid-cols-2 gap-5 p-5">
				{(parameters.data ?? []).map((parameter) => {
					const code = parameter.code ?? "";

					return (
						<ParameterControl
							key={code}
							parameter={parameter}
							value={edited[code] ?? parameter.value ?? ""}
							onChange={(value) => setEdited({ ...edited, [code]: value })}
						/>
					);
				})}
			</div>

			{change.isError ? (
				<div className="px-5 pb-5">
					<Callout tone="danger">{messageOf(change.error)}</Callout>
				</div>
			) : null}
		</Panel>
	);
}
