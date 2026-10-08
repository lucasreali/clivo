import { Plus, Trash } from "@phosphor-icons/react";
import { useSetPractitionerAvailability } from "#/api/gen/hooks";
import type { PractitionerView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import {
	submitHandler,
	useAppForm,
	useIsDirty,
	validatedBy,
} from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { usePractitionerRefresh } from "../hooks/use-practitioner-refresh";
import {
	NEW_PERIOD,
	scheduleDraftOf,
	scheduleRequestOf,
	scheduleSchema,
	WEEKDAY_OPTIONS,
} from "../model/weekly-schedule";

const FORM = "practitioner-availability";

type AvailabilityDrawerProps = {
	practitioner: PractitionerView;
	onClose: () => void;
};

/**
 * The API replaces the whole weekly schedule at once, so the drawer edits every
 * period together and saves them in one request.
 */
export function AvailabilityDrawer({
	practitioner,
	onClose,
}: AvailabilityDrawerProps) {
	const refresh = usePractitionerRefresh();

	const follow = useSetPractitionerAvailability({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: scheduleDraftOf(practitioner.availability),
		...validatedBy(scheduleSchema),
		onSubmit: ({ value }) =>
			follow.mutate(
				{
					path: { id: practitioner.id as string },
					body: scheduleRequestOf(value),
				},
				{ onError: (error) => showViolations(error, form) },
			),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={`Horários de ${practitioner.name ?? "profissional"}`}
			subtitle="A agenda só aceita consultas dentro destes períodos."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[560px]"
			footer={
				<Button type="submit" form={FORM} disabled={follow.isPending}>
					Salvar horários
				</Button>
			}
		>
			<form
				id={FORM}
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4"
			>
				<form.AppField name="periods" mode="array">
					{(periods) => (
						<>
							{periods.state.value.length === 0 ? (
								<Callout tone="warn" title="Sem horários de atendimento">
									Enquanto não houver ao menos um período, a agenda recusa
									qualquer consulta com este profissional.
								</Callout>
							) : null}

							{periods.state.value.map((_, index) => (
								<div
									// The rows have no identity of their own; removing one
									// re-renders the rest from the form state, which is the truth.
									// biome-ignore lint/suspicious/noArrayIndexKey: see above
									key={index}
									className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-start gap-2.5"
								>
									<form.AppField name={`periods[${index}].weekday`}>
										{(field) => (
											<field.SelectField
												label="Dia"
												required
												options={WEEKDAY_OPTIONS}
											/>
										)}
									</form.AppField>
									<form.AppField name={`periods[${index}].start`}>
										{(field) => (
											<field.TextField label="Início" type="time" required />
										)}
									</form.AppField>
									<form.AppField name={`periods[${index}].end`}>
										{(field) => (
											<field.TextField label="Fim" type="time" required />
										)}
									</form.AppField>
									<button
										type="button"
										onClick={() => periods.removeValue(index)}
										aria-label="Remover período"
										className="mt-[27px] flex h-[34px] w-[34px] items-center justify-center rounded-field text-faint hover:bg-danger-soft hover:text-danger"
									>
										<Trash size={16} aria-hidden="true" />
									</button>
								</div>
							))}

							<div>
								<Button
									variant="secondary"
									onClick={() => periods.pushValue({ ...NEW_PERIOD })}
								>
									<Plus size={14} aria-hidden="true" />
									Adicionar período
								</Button>
							</div>
						</>
					)}
				</form.AppField>

				{follow.isError ? (
					<Callout tone="danger" title="Horários recusados">
						{messageOf(follow.error)}
					</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
