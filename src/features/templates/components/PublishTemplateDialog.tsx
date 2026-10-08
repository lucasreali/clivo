import { usePublishRecordTemplate } from "#/api/gen/hooks";
import type { RecordTemplateView } from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { useTemplateRefresh } from "../hooks/use-template-refresh";

type PublishTemplateDialogProps = {
	template: RecordTemplateView;
	onClose: () => void;
};

export function PublishTemplateDialog({
	template,
	onClose,
}: PublishTemplateDialogProps) {
	const refresh = useTemplateRefresh();

	const publish = usePublishRecordTemplate({
		mutation: {
			onSuccess: async () => {
				await refresh();
				onClose();
			},
		},
	});

	return (
		<Modal
			title={`Publicar ${template.name ?? "modelo"} · versão ${template.version ?? 1}?`}
			dismissal="guarded"
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Voltar
					</Button>
					<Button
						onClick={() =>
							publish.mutate({ path: { id: template.id as string } })
						}
						disabled={publish.isPending}
					>
						Publicar versão
					</Button>
				</>
			}
		>
			<Callout tone="neutral">
				A partir de agora os novos atendimentos usam esta versão, e a versão
				publicada anterior com o mesmo nome é aposentada. Atendimentos já
				registrados continuam exibidos na versão em que foram preenchidos.
			</Callout>

			<Callout tone="info" title="Depois de publicada, a versão não muda">
				Para corrigir algo, edite o modelo publicado: isso abre a próxima versão
				como rascunho, sem tocar no que já está em uso.
			</Callout>

			{publish.isError ? (
				<Callout tone="danger" title="Publicação recusada">
					{messageOf(publish.error)}
				</Callout>
			) : null}
		</Modal>
	);
}
