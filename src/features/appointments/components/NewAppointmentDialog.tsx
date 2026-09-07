import { useState } from "react";
import {
	useListPractitioners,
	useListServices,
	useScheduleAppointment,
	useSearchCustomers,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { toInstant } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, Select, TextInput } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";
import { useAppointmentRefresh } from "../hooks/use-appointment-actions";

type NewAppointmentDialogProps = {
	day: string;
	onClose: () => void;
};

export function NewAppointmentDialog({
	day,
	onClose,
}: NewAppointmentDialogProps) {
	const [search, setSearch] = useState("");
	const [customerId, setCustomerId] = useState("");
	const [practitionerId, setPractitionerId] = useState("");
	const [serviceId, setServiceId] = useState("");
	const [date, setDate] = useState(day);
	const [time, setTime] = useState("09:00");

	const customers = useSearchCustomers({ query: { name: search } });
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

	function submit(event: React.FormEvent) {
		event.preventDefault();
		schedule.mutate({
			body: {
				customerId,
				practitionerId,
				serviceId,
				start: toInstant(date, time),
			},
		});
	}

	const ready = customerId && practitionerId && serviceId;

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
						disabled={!ready || schedule.isPending}
					>
						Salvar agendamento
					</Button>
				</>
			}
		>
			<form
				id="new-appointment"
				onSubmit={submit}
				className="flex flex-col gap-4"
			>
				<Field
					label="Buscar paciente"
					hint="Digite parte do nome para filtrar."
				>
					{(id) => (
						<TextInput
							id={id}
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Nome do paciente"
						/>
					)}
				</Field>

				<Field label="Paciente" required>
					{(id) => (
						<Select
							id={id}
							value={customerId}
							onChange={(event) => setCustomerId(event.target.value)}
						>
							<option value="">Selecione</option>
							{(customers.data ?? []).map((customer) => (
								<option key={customer.id} value={customer.id}>
									{customer.name}
								</option>
							))}
						</Select>
					)}
				</Field>

				<Field label="Profissional" required>
					{(id) => (
						<Select
							id={id}
							value={practitionerId}
							onChange={(event) => setPractitionerId(event.target.value)}
						>
							<option value="">Selecione</option>
							{(practitioners.data ?? []).map((practitioner) => (
								<option key={practitioner.id} value={practitioner.id}>
									{practitioner.name}
								</option>
							))}
						</Select>
					)}
				</Field>

				<Field label="Serviço" required>
					{(id) => (
						<Select
							id={id}
							value={serviceId}
							onChange={(event) => setServiceId(event.target.value)}
						>
							<option value="">Selecione</option>
							{(services.data ?? []).map((service) => (
								<option key={service.id} value={service.id}>
									{service.name}
									{service.durationMinutes
										? ` · ${service.durationMinutes} min`
										: ""}
								</option>
							))}
						</Select>
					)}
				</Field>

				<div className="grid grid-cols-2 gap-3">
					<Field label="Data" required>
						{(id) => (
							<TextInput
								id={id}
								type="date"
								value={date}
								onChange={(event) => setDate(event.target.value)}
							/>
						)}
					</Field>
					<Field label="Hora" required>
						{(id) => (
							<TextInput
								id={id}
								type="time"
								value={time}
								onChange={(event) => setTime(event.target.value)}
							/>
						)}
					</Field>
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
