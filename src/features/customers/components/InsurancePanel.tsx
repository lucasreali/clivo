import * as z from "zod";
import {
	useEnrolInsuranceMembership,
	useListCustomerInsuranceMemberships,
	useListInsurancePlans,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { requiredText } from "#/shared/form/schema";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

type InsurancePanelProps = {
	customerId: string;
};

const membershipSchema = z.object({
	planId: requiredText("Choose the insurer."),
	memberNumber: z.string(),
});

type MembershipDraft = z.infer<typeof membershipSchema>;

const EMPTY: MembershipDraft = { planId: "", memberNumber: "" };

export function InsurancePanel({ customerId }: InsurancePanelProps) {
	const memberships = useListCustomerInsuranceMemberships({
		query: { customerId },
	});
	const plans = useListInsurancePlans();
	const enrol = useEnrolInsuranceMembership();

	const form = useAppForm({
		defaultValues: EMPTY,
		...validatedBy(membershipSchema),
		onSubmit: ({ value }) =>
			enrol.mutate(
				{ body: { customerId, ...value } },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: async () => {
						form.reset(EMPTY);
						await memberships.refetch();
					},
				},
			),
	});

	return (
		<Panel>
			<PanelHeader
				title="Insurance"
				hint="Available because the insurance module is active in this clinic."
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
							Member number {membership.memberNumber ?? "—"}
						</span>
					</li>
				))}
			</ul>

			<form
				onSubmit={submitHandler(form)}
				noValidate
				className="flex items-start gap-3 border-t border-line bg-surface px-4 py-3"
			>
				<form.AppField name="planId">
					{(field) => (
						<field.SelectField
							label="Insurer"
							required
							options={(plans.data ?? []).map((plan) => ({
								value: String(plan.id),
								label: plan.name ?? "Unnamed",
							}))}
						/>
					)}
				</form.AppField>
				<form.AppField name="memberNumber">
					{(field) => <field.TextField label="Member number" />}
				</form.AppField>
				<div className="pt-6">
					<Button type="submit" disabled={enrol.isPending}>
						Link
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
