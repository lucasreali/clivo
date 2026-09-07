import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	useListPractitioners,
	useListServices,
	useScheduleAppointment,
	useSearchCustomers,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { FormComboboxField, FormTextField } from "#/shared/form/fields";
import { nationalId, phone } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import type { ComboboxOption } from "#/shared/ui/Combobox";
import { Modal } from "#/shared/ui/Modal";
import { useDebounced } from "#/shared/use-debounced";
import { useAppointmentRefresh } from "../hooks/use-appointment-actions";
import {
	type AppointmentDraft,
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

	const form = useForm<AppointmentDraft>({
		resolver: zodResolver(appointmentSchema),
		mode: "onTouched",
		defaultValues: emptyAppointmentDraft(day),
	});

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

	const submit = form.handleSubmit((values) =>
		schedule.mutate({ body: appointmentRequestOf(values) }),
	);

	const patients: ComboboxOption[] = (customers.data ?? []).map((customer) => ({
		value: String(customer.id),
		label: customer.name ?? "Sem nome",
		hint: describe(customer.nationalId, customer.phone),
	}));

	const practitionerOptions: ComboboxOption[] = (practitioners.data ?? []).map(
		(practitioner) => ({
			value: String(practitioner.id),
			label: practitioner.name ?? "Sem nome",
			hint: practitioner.licenseNumber ?? undefined,
		}),
	);

	const serviceOptions: ComboboxOption[] = (services.data ?? []).map(
		(service) => ({
			value: String(service.id),
			label: service.name ?? "Sem nome",
			hint: service.durationMinutes
				? `${service.durationMinutes} min`
				: undefined,
		}),
	);

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
				onSubmit={submit}
				noValidate
				className="flex flex-col gap-4"
			>
				<FormComboboxField
					control={form.control}
					name="customerId"
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

				<FormComboboxField
					control={form.control}
					name="practitionerId"
					label="Profissional"
					required
					options={practitionerOptions}
					placeholder="Selecione"
				/>

				<FormComboboxField
					control={form.control}
					name="serviceId"
					label="Serviço"
					required
					options={serviceOptions}
					placeholder="Selecione"
				/>

				<div className="grid grid-cols-2 gap-3">
					<FormTextField
						control={form.control}
						name="date"
						label="Data"
						type="date"
						required
					/>
					<FormTextField
						control={form.control}
						name="time"
						label="Hora"
						type="time"
						required
					/>
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
