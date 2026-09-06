import { Field, TextInput } from "#/shared/ui/Field";
import type { CustomerDraft } from "../model/customer-draft";

type CustomerFieldsProps = {
	draft: CustomerDraft;
	errors: Record<string, string>;
	onChange: (patch: Partial<CustomerDraft>) => void;
	lockNationalId?: boolean;
};

export function CustomerFields({
	draft,
	errors,
	onChange,
	lockNationalId = false,
}: CustomerFieldsProps) {
	return (
		<div className="flex flex-col gap-6">
			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Dados pessoais
				</legend>
				<div className="grid grid-cols-3 gap-3">
					<Field label="Nome completo" required error={errors.name}>
						{(id) => (
							<TextInput
								id={id}
								value={draft.name}
								onChange={(event) => onChange({ name: event.target.value })}
								required
							/>
						)}
					</Field>
					<Field
						label="CPF"
						error={errors.nationalId}
						hint={lockNationalId ? "O CPF não pode ser alterado." : undefined}
					>
						{(id) => (
							<TextInput
								id={id}
								value={draft.nationalId}
								onChange={(event) =>
									onChange({ nationalId: event.target.value })
								}
								disabled={lockNationalId}
							/>
						)}
					</Field>
					<Field label="Data de nascimento" error={errors.birthDate}>
						{(id) => (
							<TextInput
								id={id}
								type="date"
								value={draft.birthDate}
								onChange={(event) =>
									onChange({ birthDate: event.target.value })
								}
							/>
						)}
					</Field>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Contato
				</legend>
				<div className="grid grid-cols-2 gap-3">
					<Field label="Celular / WhatsApp" required error={errors.phone}>
						{(id) => (
							<TextInput
								id={id}
								value={draft.phone}
								onChange={(event) => onChange({ phone: event.target.value })}
								required
							/>
						)}
					</Field>
					<Field label="E-mail" error={errors.email}>
						{(id) => (
							<TextInput
								id={id}
								type="email"
								value={draft.email}
								onChange={(event) => onChange({ email: event.target.value })}
							/>
						)}
					</Field>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-3 border-0 p-0">
				<legend className="mb-1 text-[13.5px] font-semibold text-ink">
					Endereço
				</legend>
				<div className="grid grid-cols-[160px_1fr] gap-3">
					<Field label="CEP" error={errors.postalCode}>
						{(id) => (
							<TextInput
								id={id}
								value={draft.postalCode}
								onChange={(event) =>
									onChange({ postalCode: event.target.value })
								}
							/>
						)}
					</Field>
					<Field label="Logradouro" error={errors.street}>
						{(id) => (
							<TextInput
								id={id}
								value={draft.street}
								onChange={(event) => onChange({ street: event.target.value })}
							/>
						)}
					</Field>
				</div>
			</fieldset>
		</div>
	);
}
