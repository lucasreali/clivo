import { Link } from "@tanstack/react-router";
import { useCapabilities } from "#/features/capabilities/hooks/use-capabilities";
import { initialsOf } from "#/shared/format/name";
import { NAVIGATION, type NavigationItem } from "../model/navigation";

type SidebarProps = {
	user: string;
	role: string;
};

export function Sidebar({ user, role }: SidebarProps) {
	const { capabilities } = useCapabilities();
	const items = NAVIGATION.filter(
		(item) => !item.requires || capabilities.modules.isActive(item.requires),
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
					<SidebarLink key={item.to} item={item} />
				))}
			</nav>

			<div className="mt-auto flex items-center gap-2.5 border-t border-line px-4 py-3.5">
				<span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-ink">
					{initialsOf(user)}
				</span>
				<span className="flex flex-col leading-tight">
					<span className="text-[12.5px] text-ink">{user}</span>
					<span className="text-[11.5px] text-muted">{role}</span>
				</span>
			</div>
		</aside>
	);
}

function SidebarLink({ item }: { item: NavigationItem }) {
	return (
		<Link
			to={item.to}
			activeOptions={{ exact: item.to === "/" }}
			className="flex items-center gap-2.5 rounded-field px-2.5 py-2.5 text-[13.5px] text-muted hover:bg-neutral-soft hover:text-ink"
			activeProps={{
				className:
					"bg-brand-soft font-semibold text-brand-ink hover:bg-brand-soft",
			}}
		>
			{({ isActive }) => (
				<>
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
						<path d={item.icon} />
					</svg>
					<span>{item.label}</span>
				</>
			)}
		</Link>
	);
}
