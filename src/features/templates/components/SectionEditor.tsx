import { Plus } from "@phosphor-icons/react";
import { withForm } from "#/shared/form/app-form";
import { Button } from "#/shared/ui/Button";
import type { Option } from "#/shared/ui/options";
import { Panel } from "#/shared/ui/Panel";
import { emptyTemplate, NEW_FIELD } from "../model/template-draft";
import { FieldEditor } from "./FieldEditor";

type SectionEditorProps = {
	section: number;
	componentOptions: readonly Option[];
	onRemove?: () => void;
};

export const SectionEditor = withForm({
	defaultValues: emptyTemplate(),
	props: {} as SectionEditorProps,
	render: ({ form, section, componentOptions, onRemove }) => (
		<Panel className="flex flex-col gap-4 p-5">
			<div className="flex items-start gap-3">
				<div className="flex-1">
					<form.AppField name={`sections[${section}].name`}>
						{(field) => (
							<field.TextField
								label={`Seção ${section + 1}`}
								required
								placeholder="Anamnese, exame físico, sinais vitais…"
							/>
						)}
					</form.AppField>
				</div>
				{onRemove ? (
					<div className="pt-[27px]">
						<Button variant="ghost" onClick={onRemove}>
							Remover seção
						</Button>
					</div>
				) : null}
			</div>

			<form.AppField name={`sections[${section}].fields`} mode="array">
				{(fields) => (
					<div className="flex flex-col gap-3">
						{fields.state.value.length === 0 ? (
							<p className="m-0 text-[12.5px] text-muted">
								Esta seção ainda não tem campos.
							</p>
						) : null}

						{fields.state.value.map((_, index) => (
							<FieldEditor
								// The rows have no identity of their own; removing one re-renders
								// the rest from the form state, which is the truth.
								// biome-ignore lint/suspicious/noArrayIndexKey: see above
								key={index}
								form={form}
								section={section}
								index={index}
								componentOptions={componentOptions}
								onRemove={() => fields.removeValue(index)}
							/>
						))}

						<div>
							<Button
								variant="secondary"
								onClick={() => fields.pushValue({ ...NEW_FIELD })}
							>
								<Plus size={14} aria-hidden="true" />
								Adicionar campo
							</Button>
						</div>
					</div>
				)}
			</form.AppField>
		</Panel>
	),
});
