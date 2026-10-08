import {
	useDescribeInsurancePlan,
	useRegisterInsurancePlan,
} from "#/api/gen/hooks";
import type { PlanView } from "#/api/gen/types";
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
import { usePlanRefresh } from "../hooks/use-plan-refresh";
import {
	type PlanDraft,
	planDraftOf,
	planRequestOf,
	planSchema,
} from "../model/plan-draft";

const FORM = "insurance-plan";

type PlanDrawerProps = {
	/** Absent to register a new plan, present to redescribe this one. */
	plan?: PlanView;
	onClose: () => void;
};

export function PlanDrawer({ plan, onClose }: PlanDrawerProps) {
	const refresh = usePlanRefresh();
	const isEditing = plan !== undefined;

	const mutation = {
		onSuccess: async () => {
			await refresh();
			onClose();
		},
	};
	const register = useRegisterInsurancePlan({ mutation });
	const describe = useDescribeInsurancePlan({ mutation });
	const saving = isEditing ? describe : register;

	function save(draft: PlanDraft) {
		const body = planRequestOf(draft);
		const options = {
			onError: (error: unknown) => showViolations(error, form),
		};

		if (plan?.id) {
			describe.mutate({ path: { id: plan.id }, body }, options);
		} else {
			register.mutate({ body }, options);
		}
	}

	const form = useAppForm({
		defaultValues: planDraftOf(plan),
		...validatedBy(planSchema),
		onSubmit: ({ value }) => save(value),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={isEditing ? `Editar ${plan.name ?? "convênio"}` : "Novo convênio"}
			subtitle={
				isEditing
					? "O novo percentual vale para as próximas cobranças; as já emitidas não mudam."
					: "Depois de cadastrar, vincule os clientes ao convênio pela ficha de cada um."
			}
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[440px]"
			footer={
				<Button type="submit" form={FORM} disabled={saving.isPending}>
					{isEditing ? "Salvar alterações" : "Salvar convênio"}
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
							label="Operadora"
							required
							autoComplete="off"
							placeholder="Unimed, Amil, PetLove Saúde…"
						/>
					)}
				</form.AppField>

				<form.AppField name="reimbursementPercentage">
					{(field) => (
						<field.NumberField
							label="Reembolso sobre a cobrança (%)"
							required
							min={0}
							max={100}
							step={1}
							placeholder="0"
							hint="Quanto da conta a operadora paga. O restante fica com o cliente."
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
