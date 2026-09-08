import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cn } from "./cn";
import { CONTROL } from "./control";
import {
	OPTION_ITEM,
	OPTION_NOTICE,
	OPTION_POPUP,
	type Option,
} from "./options";

type ComboboxProps = {
	id?: string;
	name?: string;
	value: string;
	options: readonly Option[];
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
	const chosen = options.find((option) => option.value === value) ?? null;

	return (
		<ComboboxPrimitive.Root<Option>
			items={options as Option[]}
			name={name}
			value={chosen}
			disabled={disabled}
			// A field that searches upstream already receives the matches; one that was
			// handed the whole list narrows it here, so typing filters either way.
			filter={onSearch ? null : matching}
			itemToStringLabel={(option) => option.label}
			itemToStringValue={(option) => option.value}
			isItemEqualToValue={(option, selected) =>
				option.value === selected?.value
			}
			onValueChange={(option) => onChange(option?.value ?? "")}
			onInputValueChange={(term) => onSearch?.(term)}
		>
			<ComboboxPrimitive.Input
				id={id}
				ref={ref}
				placeholder={placeholder}
				onBlur={onBlur}
				className={cn(CONTROL, className)}
			/>

			<ComboboxPrimitive.Portal>
				<ComboboxPrimitive.Positioner
					sideOffset={4}
					className="z-50 outline-none"
				>
					<ComboboxPrimitive.Popup
						className={cn(OPTION_POPUP, "w-[var(--anchor-width)]")}
					>
						{isLoading ? <p className={OPTION_NOTICE}>Buscando…</p> : null}

						{isLoading ? null : (
							<ComboboxPrimitive.Empty className={OPTION_NOTICE}>
								{emptyMessage}
							</ComboboxPrimitive.Empty>
						)}

						<ComboboxPrimitive.List>
							{(option: Option) => (
								<ComboboxPrimitive.Item
									key={option.value}
									value={option}
									className={OPTION_ITEM}
								>
									<span className="font-medium">{option.label}</span>
									{option.hint ? (
										<span className="text-[11.5px] text-muted">
											{option.hint}
										</span>
									) : null}
								</ComboboxPrimitive.Item>
							)}
						</ComboboxPrimitive.List>
					</ComboboxPrimitive.Popup>
				</ComboboxPrimitive.Positioner>
			</ComboboxPrimitive.Portal>
		</ComboboxPrimitive.Root>
	);
}

function matching(option: Option, query: string) {
	const wanted = query.trim().toLowerCase();
	return (
		wanted === "" ||
		`${option.label} ${option.hint ?? ""}`.toLowerCase().includes(wanted)
	);
}
