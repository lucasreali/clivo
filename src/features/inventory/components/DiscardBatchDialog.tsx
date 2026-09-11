import { useState } from "react";
import { useDiscardBatch } from "#/api/gen/hooks";
import type { BatchView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { shortDay } from "#/shared/format/date";
import { quantity } from "#/shared/format/number";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Field, TextArea } from "#/shared/ui/Field";
import { Modal } from "#/shared/ui/Modal";
import { Select } from "#/shared/ui/Select";
import { useInventoryRefresh } from "../hooks/use-inventory-refresh";
import { REASON_MAX_LENGTH } from "../model/movement-reason";

/**
 * The contract marks the reason optional, but `MovementReason` on the API
 * refuses a blank one, so the dialog always sends something the typist chose.
 */
const JOIN = " — ";

const REASONS = [
	"Lote vencido",
	"Embalagem violada",
	"Armazenamento fora da temperatura",
	"Recolhimento do fabricante",
	"Outro motivo",
];

type DiscardBatchDialogProps = {
	batch: BatchView;
	onClose: () => void;
};

export function DiscardBatchDialog({
	batch,
	onClose,
}: DiscardBatchDialogProps) {
	const [reason, setReason] = useState(REASONS[0]);
	const [detail, setDetail] = useState("");
	const refresh = useInventoryRefresh();

	const discard = useDiscardBatch({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	// The reason and its detail travel as one string, and MovementReason caps that
	// string — so the room left for the detail shrinks as the reason grows.
	const detailLimit = REASON_MAX_LENGTH - reason.length - JOIN.length;

	function confirm() {
		discard.mutate({
			path: { id: batch.id as string },
			body: { reason: detail ? `${reason}${JOIN}${detail}` : reason },
		});
	}

	return (
		<Modal
			title={`Descartar o lote ${batch.code ?? ""}?`}
			dismissal="guarded"
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Voltar
					</Button>
					<Button
						variant="danger"
						onClick={confirm}
						disabled={discard.isPending}
					>
						Descartar lote
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				O descarte baixa {quantity(batch.quantity)} do saldo de{" "}
				{batch.productName ?? "este produto"} e registra a saída no histórico do
				produto. O lote vencia em {shortDay(batch.expiresOn)} e não volta a
				ficar disponível depois de descartado.
			</Callout>

			<Field label="Motivo do descarte" required>
				{(id) => (
					<Select
						id={id}
						value={reason}
						onChange={setReason}
						options={REASONS.map((option) => ({
							value: option,
							label: option,
						}))}
					/>
				)}
			</Field>

			<Field label="Detalhe do motivo">
				{(id) => (
					<TextArea
						id={id}
						value={detail}
						maxLength={detailLimit}
						onChange={(event) => setDetail(event.target.value)}
					/>
				)}
			</Field>

			{discard.isError ? (
				<Callout tone="danger">{messageOf(discard.error)}</Callout>
			) : null}
		</Modal>
	);
}
