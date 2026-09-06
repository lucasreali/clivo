type TopBarProps = {
	title: string;
	meta?: string;
	search?: React.ReactNode;
	actions?: React.ReactNode;
};

export function TopBar({ title, meta, search, actions }: TopBarProps) {
	return (
		<header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-panel px-6">
			<div className="flex flex-col leading-snug">
				<span className="text-[16px] font-semibold text-ink">{title}</span>
				{meta ? <span className="text-[12.5px] text-muted">{meta}</span> : null}
			</div>
			<div className="flex items-center gap-2.5">
				{search}
				{actions}
			</div>
		</header>
	);
}
