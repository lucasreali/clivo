import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "./cn";
import { CONTROL } from "./control";
import {
	OPTION_ITEM,
	OPTION_NOTICE,
	OPTION_POPUP,
	type Option,
} from "./options";

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
	return (
		<SelectPrimitive.Root
			items={options as Option[]}
			name={name}
			disabled={disabled}
			value={value === "" ? null : value}
			onValueChange={(chosen) =>
				onChange(chosen === null ? "" : String(chosen))
			}
		>
			<SelectPrimitive.Trigger
				id={id}
				ref={ref}
				onBlur={onBlur}
				className={cn(
					CONTROL,
					"flex items-center justify-between gap-2 text-left",
					className,
				)}
				{...rest}
			>
				<SelectPrimitive.Value
					className="truncate data-placeholder:text-faint"
					placeholder={placeholder}
				/>
				<SelectPrimitive.Icon className="shrink-0 text-faint">
					<CaretDown size={10} aria-hidden="true" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Positioner
					sideOffset={4}
					alignItemWithTrigger={false}
					className="z-50 outline-none"
				>
					<SelectPrimitive.Popup
						className={cn(OPTION_POPUP, "min-w-[var(--anchor-width)]")}
					>
						{options.length === 0 ? (
							<p className={OPTION_NOTICE}>{emptyMessage}</p>
						) : null}

						{options.map((option) => (
							<SelectPrimitive.Item
								key={option.value}
								value={option.value}
								className={OPTION_ITEM}
							>
								<SelectPrimitive.ItemText className="font-medium">
									{option.label}
								</SelectPrimitive.ItemText>
								{option.hint ? (
									<span className="text-[11.5px] text-muted">
										{option.hint}
									</span>
								) : null}
							</SelectPrimitive.Item>
						))}
					</SelectPrimitive.Popup>
				</SelectPrimitive.Positioner>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
