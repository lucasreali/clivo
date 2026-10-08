import { useDescribeService, useRegisterService } from "#/api/gen/hooks";
import type { ServiceView } from "#/api/gen/types";
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
import { useServiceRefresh } from "../hooks/use-service-refresh";
import {
	LONGEST_MINUTES,
	type ServiceDraft,
	SHORTEST_MINUTES,
	serviceDraftOf,
	serviceRequestOf,
	serviceSchema,
} from "../model/service-draft";

const FORM = "service";

type ServiceDrawerProps = {
	/** Absent to add a service to the catalogue, present to redescribe this one. */
	service?: ServiceView;
	onClose: () => void;
};

export function ServiceDrawer({ service, onClose }: ServiceDrawerProps) {
	const refresh = useServiceRefresh();
	const isEditing = service !== undefined;

	const mutation = {
		onSuccess: async () => {
			await refresh();
			onClose();
		},
	};
	const register = useRegisterService({ mutation });
	const describe = useDescribeService({ mutation });
	const saving = isEditing ? describe : register;

	function save(draft: ServiceDraft) {
		const body = serviceRequestOf(draft);
		const options = {
			onError: (error: unknown) => showViolations(error, form),
		};

		if (service?.id) {
			describe.mutate({ path: { id: service.id }, body }, options);
		} else {
			register.mutate({ body }, options);
		}
	}

	const form = useAppForm({
		defaultValues: serviceDraftOf(service),
		...validatedBy(serviceSchema),
		onSubmit: ({ value }) => save(value),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={isEditing ? `Editar ${service.name ?? "serviço"}` : "Novo serviço"}
			subtitle={
				isEditing
					? "O novo preço vale para as próximas cobranças; as já emitidas não mudam."
					: "O serviço passa a ser oferecido ao marcar uma consulta na agenda."
			}
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={saving.isPending}>
					{isEditing ? "Salvar alterações" : "Salvar serviço"}
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
							placeholder="Limpeza dental, sessão de fisioterapia, vacina V10…"
							hint="Não pode repetir o nome de outro serviço da clínica."
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-2 gap-3">
					<form.AppField name="durationMinutes">
						{(field) => (
							<field.NumberField
								label="Duração (min)"
								required
								min={SHORTEST_MINUTES}
								max={LONGEST_MINUTES}
								step={5}
								placeholder="30"
								hint={`De ${SHORTEST_MINUTES} a ${LONGEST_MINUTES} minutos.`}
							/>
						)}
					</form.AppField>

					<form.AppField name="price">
						{(field) => (
							<field.NumberField
								label="Preço (R$)"
								required
								min={0}
								step={1}
								placeholder="0,00"
								hint="Valor cobrado por atendimento."
							/>
						)}
					</form.AppField>
				</div>

				{saving.isError ? (
					<Callout tone="danger">{messageOf(saving.error)}</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
