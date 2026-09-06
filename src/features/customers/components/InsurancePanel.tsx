import { useState } from "react";
import {
	useEnrolInsuranceMembership,
	useListCustomerInsuranceMemberships,
	useListInsurancePlans,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, Select, TextInput } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

type InsurancePanelProps = {
	customerId: number;
};

export function InsurancePanel({ customerId }: InsurancePanelProps) {
	const [planId, setPlanId] = useState("");
	const [memberNumber, setMemberNumber] = useState("");

	const memberships = useListCustomerInsuranceMemberships({
		query: { customerId },
	});
	const plans = useListInsurancePlans();

	const enrol = useEnrolInsuranceMembership({
		mutation: {
			onSuccess: async () => {
				setMemberNumber("");
				await memberships.refetch();
			},
		},
	});

	function submit(event: React.FormEvent) {
		event.preventDefault();
		enrol.mutate({
			body: { customerId, planId: Number(planId), memberNumber },
		});
	}

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
				className="flex items-end gap-3 border-t border-line bg-surface px-4 py-3"
			>
				<Field label="Operadora">
					{(id) => (
						<Select
							id={id}
							value={planId}
							onChange={(event) => setPlanId(event.target.value)}
							required
						>
							<option value="">Selecione</option>
							{(plans.data ?? []).map((plan) => (
								<option key={plan.id} value={plan.id}>
									{plan.name}
								</option>
							))}
						</Select>
					)}
				</Field>
				<Field label="Número da carteirinha">
					{(id) => (
						<TextInput
							id={id}
							value={memberNumber}
							onChange={(event) => setMemberNumber(event.target.value)}
						/>
					)}
				</Field>
				<Button type="submit" disabled={!planId || enrol.isPending}>
					Vincular
				</Button>
			</form>

			{enrol.isError ? (
				<div className="px-4 pb-3">
					<Callout tone="danger">{messageOf(enrol.error)}</Callout>
				</div>
			) : null}
		</Panel>
	);
}
