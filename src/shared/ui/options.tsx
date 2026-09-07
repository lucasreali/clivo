import { cn } from "./cn";

export type Option = {
	value: string;
	label: string;
	hint?: string;
};

type OptionListProps = {
	id: string;
	children: React.ReactNode;
};

export function OptionList({ id, children }: OptionListProps) {
	return (
		<div
			id={id}
			role="listbox"
			// The pointer must not blur the field before the click lands, or the
			// list closes and the choice is lost.
			onMouseDown={(event) => event.preventDefault()}
			className="absolute top-full right-0 left-0 z-20 mt-1 max-h-[220px] overflow-y-auto rounded-field border border-line bg-panel p-1 shadow-[0_12px_28px_rgba(44,44,42,0.14)]"
		>
			{children}
		</div>
	);
}

type OptionItemProps = {
	id: string;
	option: Option;
	chosen: boolean;
	highlighted: boolean;
	onHighlight: () => void;
	onChoose: () => void;
};

export function OptionItem({
	id,
	option,
	chosen,
	highlighted,
	onHighlight,
	onChoose,
}: OptionItemProps) {
	return (
		// biome-ignore lint/a11y/useFocusableInteractive: focus stays on the field, which names the active option with aria-activedescendant.
		// biome-ignore lint/a11y/useKeyWithClickEvents: the field owns every key for this listbox.
		<div
			id={id}
			role="option"
			aria-selected={chosen}
			className={cn(
				"flex cursor-pointer flex-col items-start gap-0.5 rounded-[6px] px-2.5 py-2 text-[13px] text-ink",
				highlighted && "bg-brand-soft text-brand-ink",
			)}
			onMouseEnter={onHighlight}
			onClick={onChoose}
		>
			<span className="font-medium">{option.label}</span>
			{option.hint ? (
				<span className="text-[11.5px] text-muted">{option.hint}</span>
			) : null}
		</div>
	);
}

export function OptionNotice({ children }: { children: React.ReactNode }) {
	return (
		<div role="presentation" className="px-2.5 py-2 text-[12.5px] text-muted">
			{children}
		</div>
	);
}
