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
			onClick={() => announcePending("A busca global do topo")}
			className="flex h-[34px] w-[250px] items-center gap-2 rounded-field border border-line bg-surface px-2.5 text-left"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				stroke="#8B8A83"
				strokeWidth="1.5"
				strokeLinecap="round"
				aria-hidden="true"
			>
				<circle cx="7" cy="7" r="4.4" />
				<path d="M10.3 10.3L14 14" />
			</svg>
			<span className="text-[12.5px] text-faint">
				Buscar paciente, CPF ou telefone
			</span>
		</button>
	);
}

function Notifications() {
	return (
		<button
			type="button"
			onClick={() => announcePending("O painel de avisos")}
			aria-label="Avisos"
			className="relative flex h-[34px] w-[34px] items-center justify-center rounded-field border border-line bg-panel"
		>
			<svg
				width="15"
				height="15"
				viewBox="0 0 16 16"
				fill="none"
				stroke="#5F5E5A"
				strokeWidth="1.4"
				strokeLinecap="round"
				aria-hidden="true"
			>
				<path d="M8 2.2a3.6 3.6 0 00-3.6 3.6c0 3.1-1.3 4.4-1.3 4.4h9.8s-1.3-1.3-1.3-4.4A3.6 3.6 0 008 2.2zM6.6 12.4a1.5 1.5 0 002.8 0" />
			</svg>
			<span className="absolute top-[5px] right-[6px] h-1.5 w-1.5 rounded-full bg-danger" />
		</button>
	);
}
