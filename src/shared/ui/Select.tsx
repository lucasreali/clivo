import { useId, useState } from "react";
import { cn } from "./cn";
import { CONTROL } from "./control";
import { type Option, OptionItem, OptionList, OptionNotice } from "./options";

type SelectProps = {
	id?: string;
	name?: string;
	value: string;
	options: readonly Option[];
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	className?: string;
	"aria-label"?: string;
	"aria-invalid"?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
};

export function Select({
	id,
	name,
	value,
	options,
	onChange,
	onBlur,
	placeholder = "Selecione",
	emptyMessage = "Nenhuma opção disponível.",
	disabled = false,
	className,
	ref,
	...rest
}: SelectProps) {
	const listId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(0);

	const chosen = options.find((option) => option.value === value);
	const active = options[highlighted];

	function open() {
		setHighlighted(Math.max(options.indexOf(chosen ?? options[0]), 0));
		setIsOpen(true);
	}

	function choose(option: Option) {
		onChange(option.value);
		setIsOpen(false);
	}

	function move(step: number) {
		setHighlighted((current) =>
			Math.min(Math.max(current + step, 0), Math.max(options.length - 1, 0)),
		);
	}

	function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "Escape") {
			setIsOpen(false);
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!isOpen) {
				open();
				return;
			}
			move(event.key === "ArrowDown" ? 1 : -1);
			return;
		}
		if ((event.key === "Enter" || event.key === " ") && isOpen && active) {
			event.preventDefault();
			choose(active);
		}
	}

	return (
		<div className="relative">
			<input type="hidden" name={name} value={value} />
			<button
				id={id}
				ref={ref}
				type="button"
				role="combobox"
				aria-expanded={isOpen}
				aria-controls={listId}
				aria-activedescendant={
					isOpen && active ? `${listId}-${active.value}` : undefined
				}
				disabled={disabled}
				className={cn(
					CONTROL,
					"flex items-center justify-between gap-2 text-left",
					className,
				)}
				onClick={() => (isOpen ? setIsOpen(false) : open())}
				onKeyDown={onKeyDown}
				onBlur={() => {
					setIsOpen(false);
					onBlur?.();
				}}
				{...rest}
			>
				<span className={cn("truncate", !chosen && "text-faint")}>
					{chosen?.label ?? placeholder}
				</span>
				<Chevron />
			</button>

			{isOpen ? (
				<OptionList id={listId}>
					{options.length === 0 ? (
						<OptionNotice>{emptyMessage}</OptionNotice>
					) : null}

					{options.map((option, position) => (
						<OptionItem
							key={option.value}
							id={`${listId}-${option.value}`}
							option={option}
							chosen={option.value === value}
							highlighted={position === highlighted}
							onHighlight={() => setHighlighted(position)}
							onChoose={() => choose(option)}
						/>
					))}
				</OptionList>
			) : null}
		</div>
	);
}

function Chevron() {
	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0 text-faint"
			aria-hidden="true"
		>
			<path d="M2.5 4.5L6 8L9.5 4.5" />
		</svg>
	);
}
