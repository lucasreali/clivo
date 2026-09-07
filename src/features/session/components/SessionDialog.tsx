import { messageOf } from "#/shared/api-error";
import { Avatar } from "#/shared/ui/Avatar";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import { useSignOutAction } from "../hooks/use-session";

type SessionDialogProps = {
	user: string;
	role: string;
	clinic: string;
	onClose: () => void;
};

export function SessionDialog({
	user,
	role,
	clinic,
	onClose,
}: SessionDialogProps) {
	const signOut = useSignOutAction();

	return (
		<Modal
			title="Minha conta"
			subtitle="Dados da sessão aberta neste navegador."
			onClose={onClose}
			width="max-w-[420px]"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Fechar
					</Button>
					<Button
						variant="danger"
						onClick={() => signOut.mutate(undefined)}
						disabled={signOut.isPending}
					>
						{signOut.isPending ? "Saindo…" : "Sair da conta"}
					</Button>
				</>
			}
		>
			<div className="flex items-center gap-3">
				<Avatar name={user} size="md" />
				<span className="flex min-w-0 flex-col leading-tight">
					<span className="truncate text-[15px] font-semibold text-ink">
						{user}
					</span>
					<span className="text-[12.5px] text-muted">{role}</span>
				</span>
			</div>

			<dl className="flex flex-col gap-2.5 rounded-field bg-surface px-3.5 py-3">
				<SessionEntry label="Nome" value={user} />
				<SessionEntry label="Perfil de acesso" value={role} />
				<SessionEntry label="Clínica" value={clinic} />
			</dl>

			<Callout tone="neutral">
				Ao sair, a sessão é encerrada no servidor e os dados da clínica deixam
				de ficar disponíveis neste navegador.
			</Callout>

			{signOut.isError ? (
				<Callout tone="danger">{messageOf(signOut.error)}</Callout>
			) : null}
		</Modal>
	);
}

function SessionEntry({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<dt className="text-[12px] text-muted">{label}</dt>
			<dd className="truncate text-[12.5px] font-medium text-ink">{value}</dd>
		</div>
	);
}
