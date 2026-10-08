import {
	useDescribePractitioner,
	useRegisterPractitioner,
} from "#/api/gen/hooks";
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
	type PractitionerDraft,
	practitionerDraftOf,
	practitionerRequestOf,
	practitionerSchema,
} from "../model/practitioner-draft";

const FORM = "practitioner";

type PractitionerDrawerProps = {
	/** Absent to register a new practitioner, present to redescribe this one. */
	practitioner?: PractitionerView;
	onClose: () => void;
};

export function PractitionerDrawer({
	practitioner,
	onClose,
}: PractitionerDrawerProps) {
	const refresh = usePractitionerRefresh();
	const isEditing = practitioner !== undefined;

	const mutation = {
		onSuccess: async () => {
			await refresh();
			onClose();
		},
	};
	const register = useRegisterPractitioner({ mutation });
	const describe = useDescribePractitioner({ mutation });
	const saving = isEditing ? describe : register;

	function save(draft: PractitionerDraft) {
		const body = practitionerRequestOf(draft);
		const options = {
			onError: (error: unknown) => showViolations(error, form),
		};

		if (practitioner?.id) {
			describe.mutate({ path: { id: practitioner.id }, body }, options);
		} else {
			register.mutate({ body }, options);
		}
	}

	const form = useAppForm({
		defaultValues: practitionerDraftOf(practitioner),
		...validatedBy(practitionerSchema),
		onSubmit: ({ value }) => save(value),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={
				isEditing
					? `Editar ${practitioner.name ?? "profissional"}`
					: "Novo profissional"
			}
			subtitle={
				isEditing
					? "A alteração vale para a agenda e os atendimentos daqui em diante."
					: "Depois de salvar, defina os horários de atendimento para que ele apareça na agenda."
			}
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={saving.isPending}>
					{isEditing ? "Salvar alterações" : "Salvar profissional"}
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
							label="Nome"
							required
							autoComplete="off"
							placeholder="Dra. Ana Souza"
						/>
					)}
				</form.AppField>

				<form.AppField name="licenseNumber">
					{(field) => (
						<field.TextField
							label="Registro profissional"
							autoComplete="off"
							placeholder="CRO-PR 12345, CREFITO-8 54321, CRMV…"
							hint="Opcional. O número do conselho de classe do profissional."
						/>
					)}
				</form.AppField>

				{saving.isError ? (
					<Callout tone="danger">{messageOf(saving.error)}</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
