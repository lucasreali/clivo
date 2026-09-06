import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDeactivateCustomer } from "#/api/gen/hooks";
import type { CustomerView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, Select, TextArea } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";

const REASONS = [
	"Mudou de cidade",
	"Cadastro duplicado",
	"Solicitação do cliente",
	"Sem contato há mais de dois anos",
	"Outro motivo",
];

type DeactivateCustomerDialogProps = {
	customer: CustomerView;
	onClose: () => void;
};

export function DeactivateCustomerDialog({
	customer,
	onClose,
}: DeactivateCustomerDialogProps) {
	const [reason, setReason] = useState(REASONS[0]);
	const [detail, setDetail] = useState("");
	const queryClient = useQueryClient();

	const deactivate = useDeactivateCustomer({
		mutation: {
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				onClose();
			},
		},
	});

	function confirm() {
		deactivate.mutate({
			path: { id: customer.id as number },
			body: { reason: detail ? `${reason} — ${detail}` : reason },
		});
	}

	return (
		<Modal
			title={`Inativar ${customer.name ?? "cliente"}?`}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Voltar
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={deactivate.isPending}
					>
						Inativar cliente
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				Este cliente não pode ser excluído porque possui atendimentos,
				prontuário e cobranças vinculados, que a clínica é obrigada a preservar.
				Ao inativar, o cadastro sai das buscas do dia a dia e não recebe novos
				agendamentos, mas todo o histórico continua acessível pelo filtro
				“Inativos”.
			</Callout>

			<Field label="Motivo da inativação" required>
				{(id) => (
					<Select
						id={id}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
					>
						{REASONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</Select>
				)}
			</Field>

			<Field label="Detalhe do motivo">
				{(id) => (
					<TextArea
						id={id}
						value={detail}
						onChange={(event) => setDetail(event.target.value)}
					/>
				)}
			</Field>

			{deactivate.isError ? (
				<Callout tone="danger">{messageOf(deactivate.error)}</Callout>
			) : null}
		</Modal>
	);
}
