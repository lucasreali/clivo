import { Trash } from "@phosphor-icons/react";
import { withForm } from "#/shared/form/app-form";
import type { Option } from "#/shared/ui/options";
import {
	componentOf,
	DENTITION_OPTIONS,
	FIELD_TYPE_OPTIONS,
	kindOf,
} from "../model/field-types";
import { codeOf, emptyTemplate } from "../model/template-draft";

type FieldEditorProps = {
	section: number;
	index: number;
	componentOptions: readonly Option[];
	onRemove: () => void;
};

/**
 * One field of a section. The first row is what every field has; the second
 * shows only the settings its type reads, so switching the type swaps the
 * inputs instead of piling up ones that no longer apply.
 */
export const FieldEditor = withForm({
	defaultValues: emptyTemplate(),
	props: {} as FieldEditorProps,
	render: ({ form, section, index, componentOptions, onRemove }) => {
		const path = `sections[${section}].fields[${index}]` as const;

		return (
			<div className="flex flex-col gap-3 rounded-field border border-line bg-panel p-3.5">
				<div className="grid grid-cols-[1.6fr_1fr_1fr_auto] items-start gap-2.5">
					<form.AppField
						name={`${path}.label`}
						listeners={{
							// Suggest the storage key once, when the label is first left; a
							// code the author typed or one already in use is never rewritten.
							onBlur: ({ value }) => {
								if (form.getFieldValue(`${path}.code`) === "") {
									form.setFieldValue(`${path}.code`, codeOf(value));
								}
							},
						}}
					>
						{(field) => (
							<field.TextField
								label="Rótulo"
								required
								placeholder="Pressão arterial"
							/>
						)}
					</form.AppField>
					<form.AppField name={`${path}.code`}>
						{(field) => (
							<field.TextField
								label="Código"
								required
								placeholder="pressao_arterial"
							/>
						)}
					</form.AppField>
					<form.AppField name={`${path}.fieldType`}>
						{(field) => (
							<field.SelectField
								label="Tipo"
								required
								options={FIELD_TYPE_OPTIONS}
							/>
						)}
					</form.AppField>
					<button
						type="button"
						onClick={onRemove}
						aria-label="Remover campo"
						className="mt-[27px] flex h-[34px] w-[34px] items-center justify-center rounded-field text-faint hover:bg-danger-soft hover:text-danger"
					>
						<Trash size={16} aria-hidden="true" />
					</button>
				</div>

				<form.Subscribe
					selector={(state) => {
						const field = state.values.sections[section]?.fields[index];
						return {
							kind: kindOf(field?.fieldType ?? ""),
							component: field?.component ?? "",
						};
					}}
				>
					{({ kind, component }) => (
						<div className="grid grid-cols-[1fr_1fr_auto] items-start gap-2.5">
							{kind === "text" ? (
								<form.AppField name={`${path}.maxLength`}>
									{(field) => (
										<field.TextField
											label="Máximo de caracteres"
											inputMode="numeric"
											placeholder="Sem limite"
										/>
									)}
								</form.AppField>
							) : null}

							{kind === "number" ? (
								<>
									<form.AppField name={`${path}.min`}>
										{(field) => (
											<field.TextField
												label="Mínimo"
												inputMode="decimal"
												placeholder="Sem mínimo"
											/>
										)}
									</form.AppField>
									<form.AppField name={`${path}.max`}>
										{(field) => (
											<field.TextField
												label="Máximo"
												inputMode="decimal"
												placeholder="Sem máximo"
											/>
										)}
									</form.AppField>
								</>
							) : null}

							{kind === "choice" ? (
								<div className="col-span-2">
									<form.AppField name={`${path}.options`}>
										{(field) => (
											<field.TextAreaField
												label="Opções"
												required
												placeholder={"Uma por linha\nCervical\nLombar"}
											/>
										)}
									</form.AppField>
								</div>
							) : null}

							{kind === "component" ? (
								<>
									<form.AppField name={`${path}.component`}>
										{(field) => (
											<field.SelectField
												label="Componente"
												required
												options={componentOptions}
												emptyMessage="Nenhum componente disponível: ative o módulo de odontograma ou de mapa corporal."
											/>
										)}
									</form.AppField>
									{componentOf(component)?.declaresRegions ? (
										<form.AppField name={`${path}.options`}>
											{(field) => (
												<field.TextAreaField
													label="Regiões do mapa"
													required
													placeholder={"Uma por linha\ncervical\nlombar"}
												/>
											)}
										</form.AppField>
									) : component === "ODONTOGRAM" ? (
										<form.AppField name={`${path}.variant`}>
											{(field) => (
												<field.SelectField
													label="Dentição"
													options={DENTITION_OPTIONS}
												/>
											)}
										</form.AppField>
									) : null}
								</>
							) : null}

							<div className={kind === "date" ? "" : "col-start-3"}>
								<div className="pt-[29px]">
									<form.AppField name={`${path}.required`}>
										{(field) => <field.CheckboxField label="Obrigatório" />}
									</form.AppField>
								</div>
							</div>
						</div>
					)}
				</form.Subscribe>
			</div>
		);
	},
});
