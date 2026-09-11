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
			title="My account"
			subtitle="Details of the session open in this browser."
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
				<SessionEntry label="Name" value={user} />
				<SessionEntry label="Access role" value={role} />
				<SessionEntry label="Clinic" value={clinic} />
			</dl>

			<Callout tone="neutral">
				Signing out ends the session on the server, and the clinic data stops
				being available in this browser.
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
				Sign out
			</Button>
		);
	}

	return (
		<>
			<span className="mr-auto text-[12.5px] text-muted">End the session?</span>
			<Button variant="secondary" autoFocus onClick={onKeep}>
				Stay signed in
			</Button>
			<Button variant="danger" onClick={onConfirm} disabled={isPending}>
				{isPending ? "Signing out…" : "Confirm sign-out"}
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
