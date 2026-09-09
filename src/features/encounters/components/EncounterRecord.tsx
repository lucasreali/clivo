import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	useCompleteEncounter,
	useFillEncounterRecord,
	useGetEncounter,
} from "#/api/gen/hooks";
import type { EncounterView, SheetSection } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { messageOf } from "#/shared/api-error";
import { clockTime, shortDate } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { usePreviousEncounters } from "../hooks/use-previous-encounters";
import {
	answered,
	missingRequired,
	type RecordValues,
	valuesOf,
} from "../model/record-values";
import { EncounterHeader } from "./EncounterHeader";
import { SheetFieldControl } from "./fields/SheetFieldControl";
import { RecordComparison } from "./RecordComparison";

type EncounterRecordProps = {
	encounterId: string;
};

export function EncounterRecord({ encounterId }: EncounterRecordProps) {
	const [values, setValues] = useState<RecordValues>({});
	const [comparedTo, setComparedTo] = useState<string>();
	const queryClient = useQueryClient();

	const encounter = useGetEncounter({ path: { id: encounterId } });
	const fill = useFillEncounterRecord();
	const complete = useCompleteEncounter({
		mutation: { onSuccess: () => queryClient.invalidateQueries() },
	});
	const previous = usePreviousEncounters(
		encounter.data?.customer?.id,
		encounterId,
	);

	useEffect(() => {
		if (encounter.data) {
			setValues(valuesOf(encounter.data.sheet));
		}
	}, [encounter.data]);

	if (!encounter.data) {
		return <Page>Carregando ficha…</Page>;
	}

	const sheet = encounter.data.sheet;
	const sections = sheet?.sections ?? [];
	const pending = missingRequired(sheet, values);
	const open = encounter.data.status === "DRAFT";
	const lastVisit = previous[0];

	function save() {
		fill.mutate({
			path: { id: encounterId },
			body: { values: answered(values) },
		});
	}

	function finish() {
		fill.mutate(
			{ path: { id: encounterId }, body: { values: answered(values) } },
			{ onSuccess: () => complete.mutate({ path: { id: encounterId } }) },
		);
	}

	function sectionPanel(section: SheetSection) {
		return (
			<Panel key={section.name}>
				<PanelHeader
					title={section.name ?? "Seção"}
					hint={isCharted(section) ? CHART_HINT : undefined}
					actions={
						isCharted(section) && lastVisit ? (
							<Button
								variant="secondary"
								onClick={() =>
									setComparedTo(lastVisit.completedAt ?? lastVisit.startedAt)
								}
							>
								Comparar com {shortDate(lastVisit.startedAt)}
							</Button>
						) : null
					}
				/>
				<div className="flex flex-col gap-4 p-4">
					{(section.fields ?? []).map((field) => (
						<SheetFieldControl
							key={field.code}
							field={field}
							disabled={!open}
							value={values[field.code ?? ""]}
							onChange={(value) =>
								setValues({ ...values, [field.code ?? ""]: value })
							}
						/>
					))}
				</div>
			</Panel>
		);
	}

	return (
		<>
			<AppTopBar
				title="Ficha de atendimento"
				meta={metaOf(encounter.data)}
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
				<EncounterHeader encounter={encounter.data} open={open} />

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

				<div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<div className="flex flex-col gap-4">
						{sections.filter(isCharted).map(sectionPanel)}
					</div>
					<div className="flex flex-col gap-4">
						{sections
							.filter((section) => !isCharted(section))
							.map(sectionPanel)}
						<SigningState encounter={encounter.data} />
					</div>
				</div>
			</Page>

			{comparedTo ? (
				<RecordComparison
					encounterId={encounterId}
					asOf={comparedTo}
					sheet={sheet}
					onClose={() => setComparedTo(undefined)}
				/>
			) : null}
		</>
	);
}

const CHART_HINT = "Clique em uma região para marcar a condição observada";

function SigningState({ encounter }: { encounter: EncounterView }) {
	return (
		<div className="flex flex-col gap-1 px-1 text-[11.5px] text-faint">
			<span>
				{encounter.lastSavedAt
					? `Rascunho salvo às ${clockTime(encounter.lastSavedAt)}`
					: "Rascunho ainda não salvo"}
			</span>
			<span>
				{encounter.signedBy
					? `Assinado por ${encounter.signedBy.name}`
					: "Assinado digitalmente ao concluir"}
			</span>
		</div>
	);
}

function isCharted(section: SheetSection) {
	return (section.fields ?? []).some((field) => field.descriptor);
}

function metaOf(encounter: EncounterView) {
	return [
		"Atendimentos",
		encounter.customer?.name,
		shortDate(encounter.startedAt),
	]
		.filter(Boolean)
		.join(" · ");
}
