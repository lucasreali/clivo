import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	useCompleteEncounter,
	useFillEncounterRecord,
	useGetEncounter,
} from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf } from "#/shared/api-error";
import { dateTimeLabel } from "#/shared/format/date";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import {
	missingRequired,
	type RecordValues,
	valuesOf,
} from "../model/record-values";
import { SheetFieldControl } from "./fields/SheetFieldControl";

type EncounterRecordProps = {
	encounterId: number;
};

export function EncounterRecord({ encounterId }: EncounterRecordProps) {
	const [values, setValues] = useState<RecordValues>({});
	const queryClient = useQueryClient();

	const encounter = useGetEncounter({ path: { id: encounterId } });
	const fill = useFillEncounterRecord();
	const complete = useCompleteEncounter({
		mutation: { onSuccess: () => queryClient.invalidateQueries() },
	});

	useEffect(() => {
		if (encounter.data) {
			setValues(valuesOf(encounter.data.sheet));
		}
	}, [encounter.data]);

	if (!encounter.data) {
		return <Page>Carregando ficha…</Page>;
	}

	const sheet = encounter.data.sheet;
	const pending = missingRequired(sheet, values);
	const open = encounter.data.status === "DRAFT";

	function save() {
		fill.mutate({ path: { id: encounterId }, body: { values } });
	}

	function finish() {
		fill.mutate(
			{ path: { id: encounterId }, body: { values } },
			{ onSuccess: () => complete.mutate({ path: { id: encounterId } }) },
		);
	}

	return (
		<>
			<TopBar
				title="Ficha de atendimento"
				meta={`${encounter.data.customerName ?? ""} · ${dateTimeLabel(encounter.data.startedAt)}`}
				actions={
					<>
						<Button
							variant="secondary"
							onClick={save}
							disabled={!open || fill.isPending}
						>
							Salvar rascunho
						</Button>
						<Button
							onClick={finish}
							disabled={!open || pending.length > 0 || complete.isPending}
						>
							Concluir e gerar cobrança
						</Button>
					</>
				}
			/>

			<Page>
				<div className="flex items-center justify-between rounded-[10px] border border-line bg-panel px-4 py-3">
					<div className="flex flex-col">
						<span className="text-[14px] font-semibold text-ink">
							{encounter.data.customerName}
						</span>
						<span className="text-[12px] text-muted">
							{encounter.data.serviceName ?? "—"} ·{" "}
							{encounter.data.practitionerName ?? "—"}
						</span>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-[12px] text-faint">
							Modelo {sheet?.templateName ?? "—"} · versão{" "}
							{sheet?.templateVersion ?? "—"}
						</span>
						<Badge tone={open ? "brand" : "neutral"}>
							{open ? "Em atendimento" : "Concluído"}
						</Badge>
					</div>
				</div>

				{pending.length > 0 && open ? (
					<Callout tone="warn" title="Campos obrigatórios pendentes">
						{pending.join(" · ")}
					</Callout>
				) : null}

				{fill.isError ? (
					<Callout tone="danger">{messageOf(fill.error)}</Callout>
				) : null}
				{complete.isError ? (
					<Callout tone="danger">{messageOf(complete.error)}</Callout>
				) : null}

				{(sheet?.sections ?? []).map((section) => (
					<Panel key={section.name}>
						<PanelHeader title={section.name ?? "Seção"} />
						<div className="grid grid-cols-2 gap-4 p-5">
							{(section.fields ?? []).map((field) => (
								<div
									key={field.code}
									className={isWide(field.fieldType) ? "col-span-2" : undefined}
								>
									<SheetFieldControl
										field={field}
										value={values[field.code ?? ""]}
										onChange={(value) =>
											setValues({ ...values, [field.code ?? ""]: value })
										}
									/>
								</div>
							))}
						</div>
					</Panel>
				))}
			</Page>
		</>
	);
}

function isWide(fieldType: string | undefined) {
	return (
		fieldType === "LONG_TEXT" ||
		fieldType === "ODONTOGRAM" ||
		fieldType === "BODY_MAP" ||
		fieldType === "MULTI_CHOICE"
	);
}
