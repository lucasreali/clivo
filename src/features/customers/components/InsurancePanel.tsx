import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	useEnrolInsuranceMembership,
	useListCustomerInsuranceMemberships,
	useListInsurancePlans,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { FormSelectField, FormTextField } from "#/shared/form/fields";
import { requiredText } from "#/shared/form/schema";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

type InsurancePanelProps = {
	customerId: string;
};

const membershipSchema = z.object({
	planId: requiredText("Escolha a operadora."),
	memberNumber: z.string(),
});

type MembershipDraft = z.infer<typeof membershipSchema>;

const EMPTY: MembershipDraft = { planId: "", memberNumber: "" };

export function InsurancePanel({ customerId }: InsurancePanelProps) {
	const form = useForm<MembershipDraft>({
		resolver: zodResolver(membershipSchema),
		mode: "onTouched",
		defaultValues: EMPTY,
	});

	const memberships = useListCustomerInsuranceMemberships({
		query: { customerId },
	});
	const plans = useListInsurancePlans();

	const enrol = useEnrolInsuranceMembership({
		mutation: {
			onError: (error) => showViolations(error, form.setError),
			onSuccess: async () => {
				form.reset(EMPTY);
				await memberships.refetch();
			},
		},
	});

	const submit = form.handleSubmit((values) =>
		enrol.mutate({ body: { customerId, ...values } }),
	);

	return (
		<Panel>
			<PanelHeader
				title="Convênios"
				hint="Disponível porque o módulo de convênios está ativo nesta clínica."
			/>

			<ul className="m-0 list-none p-0">
				{(memberships.data ?? []).map((membership) => (
					<li
						key={membership.id}
						className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] last:border-b-0"
					>
						<span className="font-medium text-ink">
							{membership.plan?.name}
						</span>
						<span className="text-[12px] text-muted">
							Carteirinha {membership.memberNumber ?? "—"}
						</span>
					</li>
				))}
			</ul>

			<form
				onSubmit={submit}
				noValidate
				className="flex items-start gap-3 border-t border-line bg-surface px-4 py-3"
			>
				<FormSelectField
					control={form.control}
					name="planId"
					label="Operadora"
					required
					options={(plans.data ?? []).map((plan) => ({
						value: String(plan.id),
						label: plan.name ?? "Sem nome",
					}))}
				/>
				<FormTextField
					control={form.control}
					name="memberNumber"
					label="Número da carteirinha"
				/>
				<div className="pt-6">
					<Button type="submit" disabled={enrol.isPending}>
						Vincular
					</Button>
				</div>
			</form>

			{enrol.isError ? (
				<div className="px-4 pb-3">
					<Callout tone="danger">{messageOf(enrol.error)}</Callout>
				</div>
			) : null}
		</Panel>
	);
}
