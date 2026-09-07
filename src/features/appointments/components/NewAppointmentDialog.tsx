import { useState } from "react";
import {
	useListPractitioners,
	useListServices,
	useScheduleAppointment,
	useSearchCustomers,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { nationalId, phone } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import type { Option } from "#/shared/ui/options";
import { useDebounced } from "#/shared/use-debounced";
import { useAppointmentRefresh } from "../hooks/use-appointment-actions";
import {
	appointmentRequestOf,
	appointmentSchema,
	emptyAppointmentDraft,
} from "../model/appointment-draft";

type NewAppointmentDialogProps = {
	day: string;
	onClose: () => void;
};

export function NewAppointmentDialog({
	day,
	onClose,
}: NewAppointmentDialogProps) {
	const [search, setSearch] = useState("");
	const term = useDebounced(search);

	const customers = useSearchCustomers({ query: { name: term } });
	const practitioners = useListPractitioners();
	const services = useListServices();
	const refresh = useAppointmentRefresh();

	const schedule = useScheduleAppointment({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: emptyAppointmentDraft(day),
		...validatedBy(appointmentSchema),
		onSubmit: ({ value }) =>
			schedule.mutate({ body: appointmentRequestOf(value) }),
	});

	const patients: Option[] = (customers.data ?? []).map((customer) => ({
		value: String(customer.id),
		label: customer.name ?? "Sem nome",
		hint: describe(customer.nationalId, customer.phone),
	}));

	const practitionerOptions: Option[] = (practitioners.data ?? []).map(
		(practitioner) => ({
			value: String(practitioner.id),
			label: practitioner.name ?? "Sem nome",
			hint: practitioner.licenseNumber ?? undefined,
		}),
	);

	const serviceOptions: Option[] = (services.data ?? []).map((service) => ({
		value: String(service.id),
		label: service.name ?? "Sem nome",
		hint: service.durationMinutes
			? `${service.durationMinutes} min`
			: undefined,
	}));

	return (
		<Modal
			title="Novo agendamento"
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancelar
					</Button>
					<Button
						type="submit"
						form="new-appointment"
						disabled={schedule.isPending}
					>
						Salvar agendamento
					</Button>
				</>
			}
		>
			<form
				id="new-appointment"
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4"
			>
				<form.AppField name="customerId">
					{(field) => (
						<field.ComboboxField
							label="Paciente"
							required
							options={patients}
							onSearch={setSearch}
							isLoading={customers.isFetching}
							placeholder="Digite o nome do paciente"
							emptyMessage={
								search
									? `Nenhum paciente encontrado para “${search}”.`
									: "Digite parte do nome para buscar."
							}
						/>
					)}
				</form.AppField>

				<form.AppField name="practitionerId">
					{(field) => (
						<field.ComboboxField
							label="Profissional"
							required
							options={practitionerOptions}
							placeholder="Selecione"
						/>
					)}
				</form.AppField>

				<form.AppField name="serviceId">
					{(field) => (
						<field.ComboboxField
							label="Serviço"
							required
							options={serviceOptions}
							placeholder="Selecione"
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-2 gap-3">
					<form.AppField name="date">
						{(field) => <field.TextField label="Data" type="date" required />}
					</form.AppField>
					<form.AppField name="time">
						{(field) => <field.TextField label="Hora" type="time" required />}
					</form.AppField>
				</div>

				{schedule.isError ? (
					<Callout tone="danger" title="Horário indisponível">
						{messageOf(schedule.error)}
					</Callout>
				) : null}
			</form>
		</Modal>
	);
}

function describe(document: string | undefined, contact: string | undefined) {
	const details = [
		document ? nationalId(document) : "",
		contact ? phone(contact) : "",
	];
	const shown = details.filter(Boolean).join(" · ");
	return shown === "" ? undefined : shown;
}
