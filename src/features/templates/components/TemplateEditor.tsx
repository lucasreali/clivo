import { Plus } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	useDraftRecordTemplate,
	useGetRecordTemplate,
	useRedefineRecordTemplate,
} from "#/api/gen/hooks";
import type { RecordTemplateView } from "#/api/gen/types";
import { useCapabilities } from "#/features/capabilities/hooks/use-capabilities";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { messageOf, statusOf } from "#/shared/api-error";
import {
	submitHandler,
	useAppForm,
	useIsDirty,
	validatedBy,
} from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { Badge } from "#/shared/ui/Badge";
import { Button, buttonClass } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useTemplateRefresh } from "../hooks/use-template-refresh";
import { componentOptionsFor, labelOfFieldType } from "../model/field-types";
import {
	emptyTemplate,
	newSection,
	type TemplateDraft,
	templateDraftOf,
	templateRequestOf,
	templateSchema,
} from "../model/template-draft";
import {
	describeTemplateStatus,
	isDraft,
	isPublished,
} from "../model/template-status";
import { PublishTemplateDialog } from "./PublishTemplateDialog";
import { SectionEditor } from "./SectionEditor";

const FORM = "record-template";

type TemplateEditorProps = {
	/** Absent to compose a new template. */
	templateId?: string;
};

export function TemplateEditor({ templateId }: TemplateEditorProps) {
	if (!templateId) {
		return <TemplateForm />;
	}
	return <ExistingTemplate templateId={templateId} />;
}

function ExistingTemplate({ templateId }: { templateId: string }) {
	const template = useGetRecordTemplate({ path: { id: templateId } });

	if (template.isPending) {
		return (
			<>
				<AppTopBar title="Modelos de ficha" meta="Carregando modelo…" />
				<Page>
					<Panel>
						<p className="m-0 px-4 py-5 text-[12.5px] text-muted">
							Carregando modelo…
						</p>
					</Panel>
				</Page>
			</>
		);
	}

	if (!template.data) {
		const missing = statusOf(template.error) === 404;
		return (
			<>
				<AppTopBar title="Modelos de ficha" meta="Modelo indisponível" />
				<Page>
					<Panel>
						<EmptyState
							title={
								missing
									? "Modelo não encontrado"
									: "Não foi possível carregar o modelo"
							}
							description={
								missing
									? "O endereço pode estar incorreto."
									: "Tente novamente em instantes."
							}
							actions={
								<Link to="/fichas" className={buttonClass("secondary")}>
									Voltar aos modelos
								</Link>
							}
						/>
					</Panel>
				</Page>
			</>
		);
	}

	if (!isDraft(template.data.status) && !isPublished(template.data.status)) {
		return <RetiredTemplate template={template.data} />;
	}

	// Keyed by id: saving a published version navigates to the new draft, and the
	// form must start over from that draft rather than keep the old values.
	return <TemplateForm key={template.data.id} template={template.data} />;
}

type TemplateFormProps = {
	template?: RecordTemplateView;
};

function TemplateForm({ template }: TemplateFormProps) {
	const navigate = useNavigate();
	const refresh = useTemplateRefresh();
	const { capabilities } = useCapabilities();
	const [isPublishing, setPublishing] = useState(false);

	const isNew = template === undefined;
	const published = isPublished(template?.status);

	const componentOptions = useMemo(
		() =>
			componentOptionsFor(
				capabilities.modules,
				(template?.sections ?? []).flatMap((section) =>
					(section.fields ?? []).flatMap((field) =>
						field.component ? [field.component] : [],
					),
				),
			),
		[capabilities.modules, template],
	);

	const draft = useDraftRecordTemplate();
	const redefine = useRedefineRecordTemplate();
	const saving = isNew ? draft : redefine;

	async function opened(saved: RecordTemplateView) {
		await refresh();
		if (saved.id && saved.id !== template?.id) {
			navigate({ to: "/fichas/$templateId", params: { templateId: saved.id } });
		} else {
			form.reset(templateDraftOf(saved));
		}
	}

	function save(value: TemplateDraft) {
		const body = templateRequestOf(value);
		const options = {
			onError: (error: unknown) => showViolations(error, form),
			onSuccess: opened,
		};

		if (template?.id) {
			redefine.mutate({ path: { id: template.id }, body }, options);
		} else {
			draft.mutate({ body }, options);
		}
	}

	const form = useAppForm({
		defaultValues: template ? templateDraftOf(template) : emptyTemplate(),
		...validatedBy(templateSchema),
		onSubmit: ({ value }) => save(value),
	});

	const isDirty = useIsDirty(form);
	const status = describeTemplateStatus(template?.status);

	return (
		<>
			<AppTopBar
				title={isNew ? "Novo modelo de ficha" : (template.name ?? "Modelo")}
				meta={
					isNew
						? "Modelos de ficha › Novo"
						: `Modelos de ficha › Versão ${template.version ?? 1}`
				}
				actions={
					<>
						<Link to="/fichas" className={buttonClass("ghost")}>
							Voltar
						</Link>
						{isDraft(template?.status) ? (
							<Button
								variant="secondary"
								onClick={() => setPublishing(true)}
								disabled={isDirty}
								title={
									isDirty ? "Salve o rascunho antes de publicar" : undefined
								}
							>
								Publicar
							</Button>
						) : null}
						<Button type="submit" form={FORM} disabled={saving.isPending}>
							{isNew
								? "Criar rascunho"
								: published
									? `Criar versão ${(template.version ?? 1) + 1}`
									: "Salvar rascunho"}
						</Button>
					</>
				}
			/>

			<Page>
				<form
					id={FORM}
					onSubmit={submitHandler(form)}
					noValidate
					className="flex flex-col gap-4"
				>
					{published ? (
						<Callout tone="info" title="Esta versão está publicada e não muda">
							As alterações feitas aqui viram a versão{" "}
							{(template?.version ?? 1) + 1} como rascunho. Esta continua
							valendo nos atendimentos até a nova ser publicada.
						</Callout>
					) : null}

					<Panel className="flex flex-col gap-4 p-5">
						{isNew ? (
							<div className="grid grid-cols-[1.4fr_1fr] gap-3">
								<form.AppField name="name">
									{(field) => (
										<field.TextField
											label="Nome do modelo"
											required
											placeholder="Ficha de fisioterapia, ficha odontológica…"
										/>
									)}
								</form.AppField>
								<form.AppField name="requiresModule">
									{(field) => (
										<field.SelectField
											label="Exige módulo"
											hint="O modelo só pode ser publicado com este módulo ativo."
											options={[
												{ value: "", label: "Nenhum" },
												...capabilities.modules.map((module) => ({
													value: module.code ?? "",
													label: module.name ?? module.code ?? "",
												})),
											]}
										/>
									)}
								</form.AppField>
							</div>
						) : (
							<div className="flex items-center justify-between gap-3">
								<div className="flex flex-col gap-0.5">
									<span className="text-[11.5px] text-muted">
										Nome do modelo
									</span>
									<span className="text-[14px] font-semibold text-ink">
										{template.name}
									</span>
									<span className="text-[11.5px] text-faint">
										O nome liga as versões de um mesmo modelo e não muda entre
										elas.
										{template.requiresModule
											? ` Exige o módulo ${template.requiresModule}.`
											: ""}
									</span>
								</div>
								<Badge tone={status.tone}>{status.label}</Badge>
							</div>
						)}
					</Panel>

					<form.AppField name="sections" mode="array">
						{(sections) => (
							<>
								{sections.state.value.map((_, index) => (
									<SectionEditor
										// biome-ignore lint/suspicious/noArrayIndexKey: sections have no identity of their own
										key={index}
										form={form}
										section={index}
										componentOptions={componentOptions}
										onRemove={
											sections.state.value.length > 1
												? () => sections.removeValue(index)
												: undefined
										}
									/>
								))}

								<div>
									<Button
										variant="secondary"
										onClick={() => sections.pushValue(newSection())}
									>
										<Plus size={14} aria-hidden="true" />
										Adicionar seção
									</Button>
								</div>
							</>
						)}
					</form.AppField>

					{saving.isError ? (
						<Callout tone="danger" title="Modelo recusado">
							{messageOf(saving.error)}
						</Callout>
					) : null}

					{redefine.isSuccess && !isDirty ? (
						<Callout tone="brand">Rascunho salvo.</Callout>
					) : null}
				</form>
			</Page>

			{isPublishing && template ? (
				<PublishTemplateDialog
					template={template}
					onClose={() => setPublishing(false)}
				/>
			) : null}
		</>
	);
}

/** A retired version is history: encounters filled in it still read it, nobody edits it. */
function RetiredTemplate({ template }: { template: RecordTemplateView }) {
	const status = describeTemplateStatus(template.status);

	return (
		<>
			<AppTopBar
				title={template.name ?? "Modelo"}
				meta={`Modelos de ficha › Versão ${template.version ?? 1}`}
				actions={
					<Link to="/fichas" className={buttonClass("ghost")}>
						Voltar
					</Link>
				}
			/>
			<Page>
				<Callout tone="neutral" title={status.label}>
					Esta versão foi substituída por uma mais nova. Ela continua aqui
					porque os atendimentos preenchidos nela são exibidos com ela.
				</Callout>

				{(template.sections ?? []).map((section, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: sections have no identity of their own
					<Panel key={index}>
						<PanelHeader title={section.name ?? `Seção ${index + 1}`} />
						<ul className="m-0 list-none p-0">
							{(section.fields ?? []).map((field) => (
								<li
									key={field.code}
									className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] last:border-b-0"
								>
									<span className="text-ink">
										{field.label}
										{field.required ? (
											<span className="text-danger"> *</span>
										) : null}
									</span>
									<span className="text-[12px] text-muted">
										{labelOfFieldType(field.fieldType)}
										{field.component ? ` · ${field.component}` : ""}
									</span>
								</li>
							))}
						</ul>
					</Panel>
				))}
			</Page>
		</>
	);
}
