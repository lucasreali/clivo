import { withForm } from "#/shared/form/app-form";
import {
	maskNationalId,
	maskPhone,
	maskPostalCode,
} from "#/shared/format/document";
import { EMPTY_DRAFT } from "../model/customer-draft";

type CustomerFieldsProps = {
	lockNationalId?: boolean;
};

export const CustomerFields = withForm({
	defaultValues: EMPTY_DRAFT,
	props: {} as CustomerFieldsProps,
	render: ({ form, lockNationalId = false }) => (
		<div className="flex flex-col gap-6">
			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Personal details
				</legend>
				<div className="grid grid-cols-3 gap-3">
					<form.AppField name="name">
						{(field) => (
							<field.TextField label="Full name" required autoComplete="name" />
						)}
					</form.AppField>
					<form.AppField name="nationalId">
						{(field) => (
							<field.TextField
								label="CPF"
								mask={maskNationalId}
								inputMode="numeric"
								placeholder="000.000.000-00"
								disabled={lockNationalId}
								hint={lockNationalId ? "The CPF cannot be changed." : undefined}
							/>
						)}
					</form.AppField>
					<form.AppField name="birthDate">
						{(field) => <field.TextField label="Date of birth" type="date" />}
					</form.AppField>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Contact
				</legend>
				<div className="grid grid-cols-2 gap-3">
					<form.AppField name="phone">
						{(field) => (
							<field.TextField
								label="Mobile / WhatsApp"
								required
								mask={maskPhone}
								inputMode="tel"
								placeholder="(00) 00000-0000"
							/>
						)}
					</form.AppField>
					<form.AppField name="email">
						{(field) => (
							<field.TextField
								label="Email"
								type="email"
								inputMode="email"
								autoComplete="email"
							/>
						)}
					</form.AppField>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Address
				</legend>
				<div className="grid grid-cols-[160px_1fr] gap-3">
					<form.AppField name="postalCode">
						{(field) => (
							<field.TextField
								label="Postal code"
								mask={maskPostalCode}
								inputMode="numeric"
								placeholder="00000-000"
							/>
						)}
					</form.AppField>
					<form.AppField name="street">
						{(field) => <field.TextField label="Street" />}
					</form.AppField>
				</div>
			</fieldset>
		</div>
	),
});
