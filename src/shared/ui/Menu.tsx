import { cn } from "./cn";

type MenuProps = {
	label: string;
	children: React.ReactNode;
};

export function Menu({ label, children }: MenuProps) {
	return (
		<details className="relative">
			<summary
				aria-label={label}
				className="flex h-6 w-5 list-none items-center justify-center text-[12.5px] text-faint hover:text-ink"
			>
				⋯
			</summary>
			<div className="absolute top-full right-0 z-20 mt-1 flex w-[184px] flex-col rounded-field border border-line bg-panel py-1 shadow-[0_8px_24px_rgba(44,44,42,0.12)]">
				{children}
			</div>
		</details>
	);
}

type MenuItemProps = {
	onClick: () => void;
	disabled?: boolean;
	danger?: boolean;
	children: React.ReactNode;
};

export function MenuItem({
	onClick,
	disabled,
	danger,
	children,
}: MenuItemProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={(event) => {
				event.currentTarget.closest("details")?.removeAttribute("open");
				onClick();
			}}
			className={cn(
				"px-3 py-2 text-left text-[12.5px] hover:bg-neutral-soft disabled:text-faint",
				danger ? "text-danger-ink" : "text-ink",
			)}
		>
			{children}
		</button>
	);
}
