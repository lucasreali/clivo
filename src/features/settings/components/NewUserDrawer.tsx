import { useQueryClient } from "@tanstack/react-query";
import { listUsersQueryKey, useRegisterUser } from "#/api/gen/hooks";
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
import { Roles } from "../model/role";
import { EMPTY_USER, userRequestOf, userSchema } from "../model/user-draft";

const FORM = "new-user";

type NewUserDrawerProps = {
	onClose: () => void;
};

export function NewUserDrawer({ onClose }: NewUserDrawerProps) {
	const queryClient = useQueryClient();

	const register = useRegisterUser({
		mutation: {
			onSuccess: async () => {
				await queryClient.invalidateQueries({ queryKey: listUsersQueryKey() });
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: EMPTY_USER,
		...validatedBy(userSchema),
		onSubmit: ({ value }) =>
			register.mutate(
				{ body: userRequestOf(value) },
				{ onError: (error) => showViolations(error, form) },
			),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title="Nova pessoa na equipe"
			subtitle="A pessoa entra com o e-mail e a senha inicial definidos aqui."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={register.isPending}>
					Criar acesso
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
						<field.TextField label="Nome" required autoComplete="off" />
					)}
				</form.AppField>

				<form.AppField name="email">
					{(field) => (
						<field.TextField
							label="E-mail"
							type="email"
							inputMode="email"
							autoComplete="off"
							required
							hint="É o login. Não pode estar em uso em nenhuma clínica."
						/>
					)}
				</form.AppField>

				<form.AppField name="password">
					{(field) => (
						<field.TextField
							label="Senha inicial"
							type="password"
							autoComplete="new-password"
							required
							hint="Mínimo de 8 caracteres. Combine a troca no primeiro acesso."
						/>
					)}
				</form.AppField>

				<form.AppField name="role">
					{(field) => (
						<field.SelectField
							label="Perfil"
							required
							options={Roles.assignableByManager().map((option) => ({
								value: option.role,
								label: option.label,
								hint: option.hint,
							}))}
						/>
					)}
				</form.AppField>

				{register.isError ? (
					<Callout tone="danger">{messageOf(register.error)}</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
