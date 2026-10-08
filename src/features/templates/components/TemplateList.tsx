import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useListRecordTemplates } from "#/api/gen/hooks";
import type { RecordTemplateView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { Badge } from "#/shared/ui/Badge";
import { Button, buttonClass } from "#/shared/ui/Button";
import {
	columnsFor,
	DataTable,
	type TableColumns,
} from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel } from "#/shared/ui/Panel";
import { SearchBox, SituationFilter } from "#/shared/ui/SearchBox";
import { fieldCountOf } from "../model/template-draft";
import {
	describeTemplateStatus,
	isDraft,
	isPublished,
} from "../model/template-status";
import { PublishTemplateDialog } from "./PublishTemplateDialog";

const SITUATIONS = [
	{ label: "Em uso", value: "CURRENT" },
	{ label: "Aposentados", value: "RETIRED" },
	{ label: "Todos", value: "" },
];

const column = columnsFor<RecordTemplateView>();

function columnsForTemplates(
	onPublish: (template: RecordTemplateView) => void,
): TableColumns<RecordTemplateView> {
	return column.columns([
		column.accessor("name", {
			header: "Modelo",
			cell: ({ row }) => <TemplateName template={row.original} />,
		}),
		column.display({
			id: "content",
			header: "Conteúdo",
			meta: { width: "200px" },
			cell: ({ row }) => (
				<span className="text-[12.5px] text-muted">
					{plural(row.original.sections?.length ?? 0, "seção", "seções")} ·{" "}
					{plural(fieldCountOf(row.original), "campo", "campos")}
				</span>
			),
		}),
		column.accessor("status", {
			header: "Situação",
			meta: { width: "130px" },
			cell: ({ getValue }) => {
				const situation = describeTemplateStatus(getValue());
				return <Badge tone={situation.tone}>{situation.label}</Badge>;
			},
		}),
		column.display({
			id: "actions",
			meta: { width: "190px", align: "right" },
			cell: ({ row }) => (
				<TemplateActions template={row.original} onPublish={onPublish} />
			),
		}),
	]);
}

/**
 * Variability mechanism B, authored: every clinic composes its own record
 * sheets here, and the encounter screen renders whatever these templates say
 * without a line of code per clinic type.
 */
export function TemplateList() {
	const [search, setSearch] = useState("");
	const [situation, setSituation] = useState("CURRENT");
	const [publishing, setPublishing] = useState<RecordTemplateView>();

	const templates = useListRecordTemplates();

	const rows = useMemo(
		() => filtered(templates.data ?? [], search, situation),
		[templates.data, search, situation],
	);

	const columns = useMemo(() => columnsForTemplates(setPublishing), []);

	return (
		<>
			<AppTopBar
				title="Modelos de ficha"
				meta={`${rows.length} ${rows.length === 1 ? "versão listada" : "versões listadas"}`}
				actions={
					<Link to="/fichas/novo" className={buttonClass()}>
						+ Novo modelo
					</Link>
				}
			/>

			<Page>
				<div className="flex items-center gap-2.5">
					<SearchBox
						value={search}
						onChange={setSearch}
						placeholder="Buscar por nome do modelo"
						label="Buscar modelo"
					/>
					<SituationFilter
						options={SITUATIONS}
						value={situation}
						onChange={setSituation}
					/>
				</div>

				<Panel className="overflow-x-clip">
					<DataTable
						columns={columns}
						rows={rows}
						rowId={(template) => String(template.id)}
						isPending={templates.isPending}
						pendingLabel="Carregando modelos…"
						pageSize={12}
						empty={
							<NoTemplates search={search} onClear={() => setSearch("")} />
						}
					/>
				</Panel>
			</Page>

			{publishing ? (
				<PublishTemplateDialog
					template={publishing}
					onClose={() => setPublishing(undefined)}
				/>
			) : null}
		</>
	);
}

/** "Em uso" is what a clinic still works with: the published version and the draft of the next one. */
function filtered(
	templates: readonly RecordTemplateView[],
	search: string,
	situation: string,
) {
	const term = search.trim().toLowerCase();

	return templates.filter((template) => {
		const named =
			term === "" || (template.name ?? "").toLowerCase().includes(term);
		const current = template.status !== "RETIRED";

		return (
			named &&
			(situation === "" ||
				(situation === "CURRENT" && current) ||
				(situation === "RETIRED" && !current))
		);
	});
}

function plural(count: number, one: string, many: string) {
	return `${count} ${count === 1 ? one : many}`;
}

function TemplateName({ template }: { template: RecordTemplateView }) {
	return (
		<div className="flex min-w-0 flex-col leading-tight">
			<span className="truncate text-[13.5px] text-ink">{template.name}</span>
			<span className="text-[11.5px] text-faint">
				Versão {template.version ?? 1}
				{template.requiresModule
					? ` · exige o módulo ${template.requiresModule}`
					: ""}
			</span>
		</div>
	);
}

type TemplateActionsProps = {
	template: RecordTemplateView;
	onPublish: (template: RecordTemplateView) => void;
};

function TemplateActions({ template, onPublish }: TemplateActionsProps) {
	const opensAs = isDraft(template.status)
		? "Editar"
		: isPublished(template.status)
			? "Nova versão"
			: "Ver";

	return (
		<div className="flex items-center justify-end gap-3">
			{isDraft(template.status) ? (
				<button
					type="button"
					onClick={() => onPublish(template)}
					className="text-[12.5px] text-brand hover:text-brand-ink"
				>
					Publicar
				</button>
			) : null}
			<Link
				to="/fichas/$templateId"
				params={{ templateId: String(template.id) }}
				className="text-[12.5px] text-brand hover:text-brand-ink"
			>
				{opensAs}
			</Link>
		</div>
	);
}

type NoTemplatesProps = {
	search: string;
	onClear: () => void;
};

function NoTemplates({ search, onClear }: NoTemplatesProps) {
	if (search) {
		return (
			<EmptyState
				title={`Nenhum modelo encontrado para “${search}”`}
				description="Confira a grafia do nome ou troque o filtro de situação."
				actions={
					<Button variant="secondary" onClick={onClear}>
						Limpar busca
					</Button>
				}
			/>
		);
	}

	return (
		<EmptyState
			title="Nenhum modelo de ficha"
			description="O modelo define as seções e os campos que o profissional preenche no atendimento: uma escala de dor, um odontograma, os sinais vitais de um animal."
			actions={
				<Link to="/fichas/novo" className={buttonClass()}>
					Criar modelo
				</Link>
			}
		/>
	);
}
