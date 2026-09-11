import { useRegisterProduct } from "#/api/gen/hooks";
import { ModuleGate } from "#/features/capabilities/components/ModuleGate";
import { MODULE } from "#/features/capabilities/model/module-code";
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
import { useInventoryRefresh } from "../hooks/use-inventory-refresh";
import {
	EMPTY_PRODUCT,
	productRequestOf,
	productSchema,
} from "../model/product-draft";

const FORM = "new-product";

type NewProductDrawerProps = {
	onClose: () => void;
};

export function NewProductDrawer({ onClose }: NewProductDrawerProps) {
	const refresh = useInventoryRefresh();

	const register = useRegisterProduct({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: EMPTY_PRODUCT,
		...validatedBy(productSchema),
		onSubmit: ({ value }) =>
			register.mutate(
				{ body: productRequestOf(value) },
				{ onError: (error) => showViolations(error, form) },
			),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title="Novo produto"
			subtitle="O saldo começa em zero; registre a primeira entrada depois de cadastrar."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={register.isPending}>
					Salvar produto
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
							placeholder="Anestésico, luva descartável, ração…"
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-2 gap-3">
					<form.AppField name="unit">
						{(field) => (
							<field.TextField
								label="Unidade"
								required
								placeholder="ml, un, kg"
								hint="Como a clínica conta este item."
							/>
						)}
					</form.AppField>

					<form.AppField name="minStock">
						{(field) => (
							<field.NumberField
								label="Estoque mínimo"
								min={0}
								placeholder="0"
								hint="Abaixo disso o produto é sinalizado."
							/>
						)}
					</form.AppField>
				</div>

				{/* Variability mechanism A: batch control is only offered to a clinic
				    that contracted the lot module. */}
				<ModuleGate requires={MODULE.batches}>
					<form.AppField name="batchControlled">
						{(field) => (
							<field.CheckboxField label="Controlar por lote e validade — cada entrada informa código do lote e data de vencimento." />
						)}
					</form.AppField>
				</ModuleGate>

				{register.isError ? (
					<Callout tone="danger">{messageOf(register.error)}</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
