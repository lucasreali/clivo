import { useId, useState } from "react";
import { cn } from "./cn";

export type ComboboxOption = {
	value: string;
	label: string;
	hint?: string;
};

type ComboboxProps = {
	id?: string;
	name?: string;
	value: string;
	options: readonly ComboboxOption[];
	onChange: (value: string) => void;
	onSearch?: (term: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	emptyMessage?: string;
	isLoading?: boolean;
	disabled?: boolean;
	className?: string;
	ref?: React.Ref<HTMLInputElement>;
};

const CONTROL =
	"h-[38px] w-full rounded-field border border-line bg-panel px-3 text-[13px] text-ink outline-none focus:border-brand disabled:bg-surface disabled:text-faint";

export function Combobox({
	id,
	name,
	value,
	options,
	onChange,
	onSearch,
	onBlur,
	placeholder,
	emptyMessage = "Nenhum resultado.",
	isLoading = false,
	disabled = false,
	className,
	ref,
}: ComboboxProps) {
	const listId = useId();
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(0);

	const chosen = options.find((option) => option.value === value);
	// A field that searches upstream already receives the matches; one that was
	// handed the whole list narrows it here, so typing filters either way.
	const visible = onSearch ? options : options.filter(matching(query));
	const active = visible[highlighted];

	function open(term: string) {
		setQuery(term);
		setIsOpen(true);
		setHighlighted(0);
		onSearch?.(term);
	}

	function choose(option: ComboboxOption) {
		onChange(option.value);
		setQuery("");
		setIsOpen(false);
	}

	function move(step: number) {
		setHighlighted((current) =>
			Math.min(Math.max(current + step, 0), Math.max(visible.length - 1, 0)),
		);
	}

	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			setIsOpen(true);
			move(event.key === "ArrowDown" ? 1 : -1);
			return;
		}
		if (event.key === "Enter" && isOpen && active) {
			event.preventDefault();
			choose(active);
			return;
		}
		if (event.key === "Escape") {
			setIsOpen(false);
		}
	}

	return (
		<div className="relative">
			<input
				id={id}
				name={name}
				ref={ref}
				type="text"
				role="combobox"
				autoComplete="off"
				aria-expanded={isOpen}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={
					isOpen && active ? `${listId}-${active.value}` : undefined
				}
				disabled={disabled}
				placeholder={placeholder}
				className={cn(CONTROL, className)}
				value={isOpen ? query : (chosen?.label ?? "")}
				onChange={(event) => open(event.target.value)}
				onFocus={() => open("")}
				onClick={() => setIsOpen(true)}
				onKeyDown={onKeyDown}
				onBlur={() => {
					setIsOpen(false);
					onBlur?.();
				}}
			/>

			{isOpen ? (
				<div
					id={listId}
					role="listbox"
					// The pointer must not blur the input before the click lands, or the
					// list closes and the choice is lost.
					onMouseDown={(event) => event.preventDefault()}
					className="absolute top-full right-0 left-0 z-20 mt-1 max-h-[220px] overflow-y-auto rounded-field border border-line bg-panel p-1 shadow-[0_12px_28px_rgba(44,44,42,0.14)]"
				>
					{isLoading ? <Notice>Buscando…</Notice> : null}

					{!isLoading && visible.length === 0 ? (
						<Notice>{emptyMessage}</Notice>
					) : null}

					{visible.map((option, position) => (
						// biome-ignore lint/a11y/useFocusableInteractive: focus stays on the input, which names the active option with aria-activedescendant.
						// biome-ignore lint/a11y/useKeyWithClickEvents: the input owns every key for this listbox.
						<div
							key={option.value}
							id={`${listId}-${option.value}`}
							role="option"
							aria-selected={option.value === value}
							className={cn(
								"flex cursor-pointer flex-col items-start gap-0.5 rounded-[6px] px-2.5 py-2 text-[13px] text-ink",
								position === highlighted && "bg-brand-soft text-brand-ink",
							)}
							onMouseEnter={() => setHighlighted(position)}
							onClick={() => choose(option)}
						>
							<span className="font-medium">{option.label}</span>
							{option.hint ? (
								<span className="text-[11.5px] text-muted">{option.hint}</span>
							) : null}
						</div>
					))}
				</div>
			) : null}
		</div>
	);
}

function matching(query: string) {
	const wanted = query.trim().toLowerCase();
	return (option: ComboboxOption) =>
		wanted === "" ||
		`${option.label} ${option.hint ?? ""}`.toLowerCase().includes(wanted);
}

function Notice({ children }: { children: React.ReactNode }) {
	return (
		<div role="presentation" className="px-2.5 py-2 text-[12.5px] text-muted">
			{children}
		</div>
	);
}
