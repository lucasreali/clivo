import { useDescribeProduct, useRegisterProduct } from "#/api/gen/hooks";
import type { ProductView } from "#/api/gen/types";
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
	type ProductDraft,
	productDraftOf,
	productRequestOf,
	productSchema,
} from "../model/product-draft";

const FORM = "product";

type ProductDrawerProps = {
	/** Absent to register a new product, present to redescribe this one. */
	product?: ProductView;
	onClose: () => void;
};

export function ProductDrawer({ product, onClose }: ProductDrawerProps) {
	const refresh = useInventoryRefresh();
	const isEditing = product !== undefined;

	const mutation = {
		onSuccess: async () => {
			await refresh();
			onClose();
		},
	};
	const register = useRegisterProduct({ mutation });
	const describe = useDescribeProduct({ mutation });
	const saving = isEditing ? describe : register;

	function save(draft: ProductDraft) {
		const body = productRequestOf(draft);
		const options = {
			onError: (error: unknown) => showViolations(error, form),
		};

		if (product?.id) {
			describe.mutate({ path: { id: product.id }, body }, options);
		} else {
			register.mutate({ body }, options);
		}
	}

	const form = useAppForm({
		defaultValues: productDraftOf(product),
		...validatedBy(productSchema),
		onSubmit: ({ value }) => save(value),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={isEditing ? `Editar ${product.name ?? "produto"}` : "Novo produto"}
			subtitle={
				isEditing
					? "O saldo não muda aqui; use Movimentar para registrar entradas, saídas e ajustes."
					: "O saldo começa em zero; registre a primeira entrada depois de cadastrar."
			}
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={saving.isPending}>
					{isEditing ? "Salvar alterações" : "Salvar produto"}
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

				{saving.isError ? (
					<Callout tone="danger">{messageOf(saving.error)}</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
