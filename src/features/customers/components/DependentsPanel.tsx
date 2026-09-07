import * as z from "zod";
import {
	useListCustomerDependents,
	useRegisterDependent,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { requiredText } from "#/shared/form/schema";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

type DependentsPanelProps = {
	customerId: string;
};

const dependentSchema = z.object({
	name: requiredText("Informe o nome do dependente."),
	type: requiredText("Informe o tipo."),
	birthDate: z.string(),
});

type DependentDraft = z.infer<typeof dependentSchema>;

const EMPTY: DependentDraft = { name: "", type: "", birthDate: "" };

export function DependentsPanel({ customerId }: DependentsPanelProps) {
	const dependents = useListCustomerDependents({ path: { customerId } });
	const register = useRegisterDependent();

	const form = useAppForm({
		defaultValues: EMPTY,
		...validatedBy(dependentSchema),
		onSubmit: ({ value }) =>
			register.mutate(
				{
					path: { customerId },
					body: { ...value, birthDate: value.birthDate || undefined },
				},
				{
					onError: (error) => showViolations(error, form),
					onSuccess: async () => {
						form.reset(EMPTY);
						await dependents.refetch();
					},
				},
			),
	});

	return (
		<Panel>
			<PanelHeader
				title="Dependentes"
				hint="Disponível porque o módulo de dependentes está ativo nesta clínica."
			/>

			<ul className="m-0 list-none p-0">
				{(dependents.data ?? []).map((dependent) => (
					<li
						key={dependent.id}
						className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] last:border-b-0"
					>
						<span className="font-medium text-ink">{dependent.name}</span>
						<span className="text-[12px] text-muted">
							{dependent.type}
							{dependent.ageInYears ? ` · ${dependent.ageInYears} anos` : ""}
						</span>
					</li>
				))}
			</ul>

			<form
				onSubmit={submitHandler(form)}
				noValidate
				className="flex items-start gap-3 border-t border-line bg-surface px-4 py-3"
			>
				<form.AppField name="name">
					{(field) => <field.TextField label="Nome" required />}
				</form.AppField>
				<form.AppField name="type">
					{(field) => (
						<field.TextField
							label="Tipo"
							required
							hint="Ex.: filho, cônjuge, animal."
						/>
					)}
				</form.AppField>
				<form.AppField name="birthDate">
					{(field) => <field.TextField label="Nascimento" type="date" />}
				</form.AppField>
				<div className="pt-6">
					<Button type="submit" disabled={register.isPending}>
						Adicionar
					</Button>
				</div>
			</form>

			{register.isError ? (
				<div className="px-4 pb-3">
					<Callout tone="danger">{messageOf(register.error)}</Callout>
				</div>
			) : null}
		</Panel>
	);
}
