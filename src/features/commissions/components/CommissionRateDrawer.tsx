import { useSetCommissionRate } from "#/api/gen/hooks";
import type { RateView } from "#/api/gen/types";
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
import { useCommissionRefresh } from "../hooks/use-commission-refresh";
import { rateDraftOf, rateRequestOf, rateSchema } from "../model/rate-draft";

const FORM = "commission-rate";

type CommissionRateDrawerProps = {
	rate: RateView;
	onClose: () => void;
};

export function CommissionRateDrawer({
	rate,
	onClose,
}: CommissionRateDrawerProps) {
	const refresh = useCommissionRefresh();

	const change = useSetCommissionRate({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	const form = useAppForm({
		defaultValues: rateDraftOf(rate.percentage),
		...validatedBy(rateSchema),
		onSubmit: ({ value }) =>
			change.mutate(
				{
					path: { practitionerId: rate.practitionerId as string },
					body: rateRequestOf(value),
				},
				{ onError: (error) => showViolations(error, form) },
			),
	});

	const isDirty = useIsDirty(form);

	return (
		<Drawer
			title={`Percentual de ${rate.practitionerName ?? "profissional"}`}
			subtitle="Vale para os atendimentos faturados a partir de agora; meses já fechados não mudam."
			onClose={onClose}
			isDirty={isDirty}
			width="max-w-[420px]"
			footer={
				<Button type="submit" form={FORM} disabled={change.isPending}>
					Salvar percentual
				</Button>
			}
		>
			<form
				id={FORM}
				onSubmit={submitHandler(form)}
				noValidate
				className="flex flex-col gap-4"
			>
				<form.AppField name="percentage">
					{(field) => (
						<field.NumberField
							label="Percentual sobre o faturado (%)"
							required
							min={0}
							max={100}
							step={1}
							placeholder="0"
							hint="De 0 a 100. Zero significa que o profissional não recebe comissão."
						/>
					)}
				</form.AppField>

				{change.isError ? (
					<Callout tone="danger" title="Percentual recusado">
						{messageOf(change.error)}
					</Callout>
				) : null}
			</form>
		</Drawer>
	);
}
