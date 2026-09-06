type EmptyStateProps = {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	footnote?: string;
};

export function EmptyState({
	title,
	description,
	actions,
	footnote,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
			<span className="text-[14px] font-semibold text-ink">{title}</span>
			{description ? (
				<p className="m-0 max-w-md text-[12.5px] leading-relaxed text-muted">
					{description}
				</p>
			) : null}
			{actions ? <div className="mt-1 flex gap-2">{actions}</div> : null}
			{footnote ? (
				<span className="text-[11.5px] text-faint">{footnote}</span>
			) : null}
		</div>
	);
}
