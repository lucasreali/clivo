import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	useListCustomerDependents,
	useRegisterDependent,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { FormTextField } from "#/shared/form/fields";
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
	const form = useForm<DependentDraft>({
		resolver: zodResolver(dependentSchema),
		mode: "onTouched",
		defaultValues: EMPTY,
	});

	const dependents = useListCustomerDependents({ path: { customerId } });
	const register = useRegisterDependent({
		mutation: {
			onError: (error) => showViolations(error, form.setError),
			onSuccess: async () => {
				form.reset(EMPTY);
				await dependents.refetch();
			},
		},
	});

	const submit = form.handleSubmit((values) =>
		register.mutate({
			path: { customerId },
			body: { ...values, birthDate: values.birthDate || undefined },
		}),
	);

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
				onSubmit={submit}
				noValidate
				className="flex items-start gap-3 border-t border-line bg-surface px-4 py-3"
			>
				<FormTextField
					control={form.control}
					name="name"
					label="Nome"
					required
				/>
				<FormTextField
					control={form.control}
					name="type"
					label="Tipo"
					required
					hint="Ex.: filho, cônjuge, animal."
				/>
				<FormTextField
					control={form.control}
					name="birthDate"
					label="Nascimento"
					type="date"
				/>
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
