import { useState } from "react";
import { messageOf } from "#/shared/api-error";
import { Avatar } from "#/shared/ui/Avatar";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { useSignOutAction } from "../hooks/use-session";

type SessionDrawerProps = {
	user: string;
	role: string;
	clinic: string;
	onClose: () => void;
};

export function SessionDrawer({
	user,
	role,
	clinic,
	onClose,
}: SessionDrawerProps) {
	const [isConfirming, setIsConfirming] = useState(false);
	const signOut = useSignOutAction();

	return (
		<Drawer
			title="Minha conta"
			subtitle="Dados da sessão aberta neste navegador."
			onClose={onClose}
			side="left"
			footer={
				<SignOutAction
					isConfirming={isConfirming}
					isPending={signOut.isPending}
					onAsk={() => setIsConfirming(true)}
					onKeep={() => setIsConfirming(false)}
					onConfirm={() => signOut.mutate(undefined)}
				/>
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
		</Drawer>
	);
}

type SignOutActionProps = {
	isConfirming: boolean;
	isPending: boolean;
	onAsk: () => void;
	onKeep: () => void;
	onConfirm: () => void;
};

function SignOutAction({
	isConfirming,
	isPending,
	onAsk,
	onKeep,
	onConfirm,
}: SignOutActionProps) {
	if (!isConfirming) {
		return (
			<Button variant="danger" onClick={onAsk}>
				Sair da conta
			</Button>
		);
	}

	return (
		<>
			<span className="mr-auto text-[12.5px] text-muted">
				Encerrar a sessão?
			</span>
			<Button variant="secondary" autoFocus onClick={onKeep}>
				Continuar conectado
			</Button>
			<Button variant="danger" onClick={onConfirm} disabled={isPending}>
				{isPending ? "Saindo…" : "Confirmar saída"}
			</Button>
		</>
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
