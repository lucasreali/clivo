import type { ClinicView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import {
	submitHandler,
	useAppForm,
	useIsDirty,
	validatedBy,
} from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { maskTaxId } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { useClinicDetails } from "../hooks/use-clinics";
import {
	clinicDetailsDraftOf,
	clinicDetailsRequestOf,
	clinicDetailsSchema,
} from "../model/clinic-draft";

const FORM = "clinic-details";

type ClinicDetailsDrawerProps = {
	clinic: ClinicView;
	onClose: () => void;
};

export function ClinicDetailsDrawer({
	clinic,
	onClose,
}: ClinicDetailsDrawerProps) {
	const update = useClinicDetails();

	const form = useAppForm({
		defaultValues: clinicDetailsDraftOf(clinic),
		...validatedBy(clinicDetailsSchema),
		onSubmit: ({ value }) =>
			update.mutate(
				{
					path: { tenantId: clinic.id as string },
					body: clinicDetailsRequestOf(value),
				},
				{
					onError: (error) => showViolations(error, form),
					onSuccess: onClose,
				},
			),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={`Dados de ${clinic.name ?? "clínica"}`}
			subtitle="Módulos, parâmetros e equipe não mudam aqui; só a identificação da clínica."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[460px]"
			footer={
				<Button type="submit" form={FORM} disabled={update.isPending}>
					Salvar dados
				</Button>
			}
		>
			<form
				id={FORM}
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4"
			>
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							label="Nome da clínica"
							required
							hint="É o nome que a equipe vê ao entrar."
						/>
					)}
				</form.AppField>
				<form.AppField name="legalName">
					{(field) => <field.TextField label="Razão social" />}
				</form.AppField>
				<form.AppField name="taxId">
					{(field) => (
						<field.TextField
							label="CNPJ"
							mask={maskTaxId}
							inputMode="numeric"
							placeholder="00.000.000/0000-00"
							hint="Um CNPJ pertence a uma única clínica da plataforma."
						/>
					)}
				</form.AppField>
				<form.AppField name="segment">
					{(field) => (
						<field.TextField
							label="Segmento"
							hint="Odontologia, fisioterapia, veterinária… orienta a implantação, não trava a configuração."
						/>
					)}
				</form.AppField>

				{update.isError ? (
					<Callout tone="danger">{messageOf(update.error)}</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
