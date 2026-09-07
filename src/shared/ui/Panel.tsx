import { cn } from "./cn";

type PanelProps = {
	className?: string;
	children: React.ReactNode;
};

export function Panel({ className, children }: PanelProps) {
	return (
		<section
			className={cn("rounded-field border border-line bg-panel", className)}
		>
			{children}
		</section>
	);
}

type PanelHeaderProps = {
	title: string;
	hint?: string;
	actions?: React.ReactNode;
};

export function PanelHeader({ title, hint, actions }: PanelHeaderProps) {
	return (
		<header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
			<div className="flex flex-col">
				<span className="text-[13.5px] font-semibold text-ink">{title}</span>
				{hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
			</div>
			{actions}
		</header>
	);
}
