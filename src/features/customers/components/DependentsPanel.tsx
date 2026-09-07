import { useState } from "react";
import {
	useListCustomerDependents,
	useRegisterDependent,
} from "#/api/gen/hooks";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextInput } from "#/shared/ui/Field";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

type DependentsPanelProps = {
	customerId: string;
};

export function DependentsPanel({ customerId }: DependentsPanelProps) {
	const [name, setName] = useState("");
	const [type, setType] = useState("");
	const [birthDate, setBirthDate] = useState("");

	const dependents = useListCustomerDependents({ path: { customerId } });
	const register = useRegisterDependent({
		mutation: {
			onSuccess: async () => {
				setName("");
				setType("");
				setBirthDate("");
				await dependents.refetch();
			},
		},
	});

	function submit(event: React.FormEvent) {
		event.preventDefault();
		register.mutate({
			path: { customerId },
			body: { name, type, birthDate: birthDate || undefined },
		});
	}

	return (
		<Panel>
			<PanelHeader
				title="Dependentes"
				hint="Disponível porque o módulo de dependentes está ativo nesta clínica."
			/>

			<ul className="m-0 list-none p-0">
				{(dependents.data ?? []).map((dependent) => (
					<li
						key={dependent.id}
						className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] last:border-b-0"
					>
						<span className="font-medium text-ink">{dependent.name}</span>
						<span className="text-[12px] text-muted">
							{dependent.type}
							{dependent.ageInYears ? ` · ${dependent.ageInYears} anos` : ""}
						</span>
					</li>
				))}
			</ul>

			<form
				onSubmit={submit}
				className="flex items-end gap-3 border-t border-line bg-surface px-4 py-3"
			>
				<Field label="Nome">
					{(id) => (
						<TextInput
							id={id}
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					)}
				</Field>
				<Field label="Tipo" hint="Ex.: filho, cônjuge, animal.">
					{(id) => (
						<TextInput
							id={id}
							value={type}
							onChange={(event) => setType(event.target.value)}
							required
						/>
					)}
				</Field>
				<Field label="Nascimento">
					{(id) => (
						<TextInput
							id={id}
							type="date"
							value={birthDate}
							onChange={(event) => setBirthDate(event.target.value)}
						/>
					)}
				</Field>
				<Button type="submit" disabled={register.isPending}>
					Adicionar
				</Button>
			</form>

			{register.isError ? (
				<div className="px-4 pb-3">
					<Callout tone="danger">{messageOf(register.error)}</Callout>
				</div>
			) : null}
		</Panel>
	);
}
