import { Bell, MagnifyingGlass } from "@phosphor-icons/react";
import { announcePending } from "#/shared/ui/pending";
import { TopBar } from "./TopBar";

type AppTopBarProps = {
	title: string;
	meta?: string;
	actions?: React.ReactNode;
};

export function AppTopBar({ title, meta, actions }: AppTopBarProps) {
	return (
		<TopBar
			title={title}
			meta={meta}
			actions={
				<>
					<GlobalSearch />
					<Notifications />
					{actions}
				</>
			}
		/>
	);
}

function GlobalSearch() {
	return (
		<button
			type="button"
			onClick={() => announcePending("The global search in the top bar")}
			className="flex h-[34px] w-[250px] items-center gap-2 rounded-field border border-line bg-surface px-2.5 text-left"
		>
			<MagnifyingGlass
				size={14}
				className="shrink-0 text-faint"
				aria-hidden="true"
			/>
			<span className="text-[12.5px] text-faint">
				Search by patient, CPF or phone
			</span>
		</button>
	);
}

function Notifications() {
	return (
		<button
			type="button"
			onClick={() => announcePending("The notifications panel")}
			aria-label="Notifications"
			className="relative flex h-[34px] w-[34px] items-center justify-center rounded-field border border-line bg-panel"
		>
			<Bell size={15} className="text-muted" aria-hidden="true" />
			<span className="absolute top-[5px] right-[6px] h-1.5 w-1.5 rounded-full bg-danger" />
		</button>
	);
}
