import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCapabilities } from "#/features/capabilities/hooks/use-capabilities";
import { SessionDialog } from "#/features/session/components/SessionDialog";
import { Avatar } from "#/shared/ui/Avatar";
import { announcePending } from "#/shared/ui/pending";
import { NAVIGATION, type NavigationItem } from "../model/navigation";

const ENTRY =
	"flex items-center gap-2.5 rounded-field px-2.5 py-[9px] text-left text-[13.5px] text-muted hover:bg-neutral-soft hover:text-ink";

type SidebarProps = {
	user: string;
	role: string;
	clinic: string;
};

export function Sidebar({ user, role, clinic }: SidebarProps) {
	const { capabilities } = useCapabilities();
	const [isAccountOpen, setAccountOpen] = useState(false);
	const items = NAVIGATION.filter(
		(item) => !item.requires || capabilities.modules.reaches(item.requires),
	);

	return (
		<aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-line bg-panel">
			<div className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-5">
				<span className="h-2.5 w-2.5 rounded-sm bg-brand" />
				<span className="text-[17px] font-semibold tracking-[1.6px] text-ink">
					CLIVO
				</span>
			</div>

			<nav className="flex flex-col gap-0.5 px-2.5 py-3.5">
				{items.map((item) => (
					<SidebarEntry key={item.to} item={item} />
				))}
			</nav>

			<button
				type="button"
				onClick={() => setAccountOpen(true)}
				aria-haspopup="dialog"
				className="mt-auto flex items-center gap-2.5 border-t border-line px-4 py-3.5 text-left hover:bg-neutral-soft"
			>
				<Avatar name={user} />
				<span className="flex min-w-0 flex-col leading-tight">
					<span className="truncate text-[12.5px] text-ink">{user}</span>
					<span className="truncate text-[11.5px] text-muted">
						{role} · {clinic}
					</span>
				</span>
			</button>

			{isAccountOpen ? (
				<SessionDialog
					user={user}
					role={role}
					clinic={clinic}
					onClose={() => setAccountOpen(false)}
				/>
			) : null}
		</aside>
	);
}

function SidebarEntry({ item }: { item: NavigationItem }) {
	if (item.pending) {
		return (
			<button
				type="button"
				onClick={() => announcePending(item.label)}
				className={ENTRY}
			>
				<SidebarIcon path={item.icon} isActive={false} />
				<span>{item.label}</span>
			</button>
		);
	}

	return (
		<Link
			to={item.to}
			activeOptions={{ exact: item.to === "/" }}
			className={ENTRY}
			activeProps={{
				className:
					"bg-brand-soft font-semibold text-brand-ink hover:bg-brand-soft",
			}}
		>
			{({ isActive }) => (
				<>
					<SidebarIcon path={item.icon} isActive={isActive} />
					<span>{item.label}</span>
				</>
			)}
		</Link>
	);
}

function SidebarIcon({ path, isActive }: { path: string; isActive: boolean }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke={isActive ? "#1D9E75" : "#8B8A83"}
			strokeWidth="1.4"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={path} />
		</svg>
	);
}
