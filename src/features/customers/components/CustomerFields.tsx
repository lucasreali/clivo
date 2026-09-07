import type { Control } from "react-hook-form";
import { FormTextField } from "#/shared/form/fields";
import {
	maskNationalId,
	maskPhone,
	maskPostalCode,
} from "#/shared/format/document";
import type { CustomerDraft } from "../model/customer-draft";

type CustomerFieldsProps = {
	control: Control<CustomerDraft>;
	lockNationalId?: boolean;
};

export function CustomerFields({
	control,
	lockNationalId = false,
}: CustomerFieldsProps) {
	return (
		<div className="flex flex-col gap-6">
			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Dados pessoais
				</legend>
				<div className="grid grid-cols-3 gap-3">
					<FormTextField
						control={control}
						name="name"
						label="Nome completo"
						required
						autoComplete="name"
					/>
					<FormTextField
						control={control}
						name="nationalId"
						label="CPF"
						mask={maskNationalId}
						inputMode="numeric"
						placeholder="000.000.000-00"
						disabled={lockNationalId}
						hint={lockNationalId ? "O CPF não pode ser alterado." : undefined}
					/>
					<FormTextField
						control={control}
						name="birthDate"
						label="Data de nascimento"
						type="date"
					/>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Contato
				</legend>
				<div className="grid grid-cols-2 gap-3">
					<FormTextField
						control={control}
						name="phone"
						label="Celular / WhatsApp"
						required
						mask={maskPhone}
						inputMode="tel"
						placeholder="(00) 00000-0000"
					/>
					<FormTextField
						control={control}
						name="email"
						label="E-mail"
						type="email"
						inputMode="email"
						autoComplete="email"
					/>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Endereço
				</legend>
				<div className="grid grid-cols-[160px_1fr] gap-3">
					<FormTextField
						control={control}
						name="postalCode"
						label="CEP"
						mask={maskPostalCode}
						inputMode="numeric"
						placeholder="00000-000"
					/>
					<FormTextField control={control} name="street" label="Logradouro" />
				</div>
			</fieldset>
		</div>
	);
}
