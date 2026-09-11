import { useState } from "react";
import {
	useListPractitioners,
	useListServices,
	useScheduleAppointment,
	useSearchCustomers,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import {
	submitHandler,
	useAppForm,
	useIsDirty,
	validatedBy,
} from "#/shared/form/app-form";
import { nationalId, phone } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import type { Option } from "#/shared/ui/options";
import { useDebounced } from "#/shared/use-debounced";
import { useAppointmentRefresh } from "../hooks/use-appointment-actions";
import {
	appointmentRequestOf,
	appointmentSchema,
	emptyAppointmentDraft,
} from "../model/appointment-draft";

type NewAppointmentDrawerProps = {
	day: string;
	onClose: () => void;
};

export function NewAppointmentDrawer({
	day,
	onClose,
}: NewAppointmentDrawerProps) {
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

	const isDirty = useIsDirty(form);

	const patients: Option[] = (customers.data ?? []).map((customer) => ({
		value: String(customer.id),
		label: customer.name ?? "Unnamed",
		hint: describe(customer.nationalId, customer.phone),
	}));

	const practitionerOptions: Option[] = (practitioners.data ?? []).map(
		(practitioner) => ({
			value: String(practitioner.id),
			label: practitioner.name ?? "Unnamed",
			hint: practitioner.licenseNumber ?? undefined,
		}),
	);

	const serviceOptions: Option[] = (services.data ?? []).map((service) => ({
		value: String(service.id),
		label: service.name ?? "Unnamed",
		hint: service.durationMinutes
			? `${service.durationMinutes} min`
			: undefined,
	}));

	return (
		<Drawer
			title="New appointment"
			subtitle="The day schedule stays visible behind this panel."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[460px]"
			footer={
				<Button
					type="submit"
					form="new-appointment"
					disabled={schedule.isPending}
				>
					Save appointment
				</Button>
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
							label="Patient"
							required
							options={patients}
							onSearch={setSearch}
							isLoading={customers.isFetching}
							placeholder="Type the patient name"
							emptyMessage={
								search
									? `No patient found for “${search}”.`
									: "Type part of the name to search."
							}
						/>
					)}
				</form.AppField>

				<form.AppField name="practitionerId">
					{(field) => (
						<field.ComboboxField
							label="Practitioner"
							required
							options={practitionerOptions}
							placeholder="Select"
						/>
					)}
				</form.AppField>

				<form.AppField name="serviceId">
					{(field) => (
						<field.ComboboxField
							label="Service"
							required
							options={serviceOptions}
							placeholder="Select"
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-2 gap-3">
					<form.AppField name="date">
						{(field) => <field.TextField label="Date" type="date" required />}
					</form.AppField>
					<form.AppField name="time">
						{(field) => <field.TextField label="Time" type="time" required />}
					</form.AppField>
				</div>

				{schedule.isError ? (
					<Callout tone="danger" title="Time slot unavailable">
						{messageOf(schedule.error)}
					</Callout>
				) : null}
			</form>
		</Drawer>
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
