import { NumberField } from "@base-ui/react/number-field";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { cn } from "./cn";
import { CONTROL } from "./control";

const STEPPER =
	"flex flex-1 items-center justify-center text-faint transition-colors hover:bg-surface hover:text-ink disabled:text-line disabled:hover:bg-transparent";

type NumberInputProps = {
	id?: string;
	name?: string;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	min?: number;
	max?: number;
	step?: number;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	"aria-invalid"?: boolean;
	ref?: React.Ref<HTMLInputElement>;
};

export function NumberInput({
	id,
	value,
	onChange,
	onBlur,
	placeholder,
	className,
	ref,
	"aria-invalid": invalid,
	...rest
}: NumberInputProps) {
	return (
		<NumberField.Root
			{...rest}
			value={numberOf(value)}
			// Without a thousands mark the parser reads both "1.5" and "1,5" as one and a
			// half, so a typist reaching for either separator gets the number they meant.
			format={{ useGrouping: false }}
			onValueChange={(next) => onChange(next === null ? "" : String(next))}
		>
			<NumberField.Group className="relative flex w-full items-center">
				<NumberField.Input
					id={id}
					ref={ref}
					onBlur={onBlur}
					placeholder={placeholder}
					aria-invalid={invalid}
					className={cn(CONTROL, "pr-10", className)}
				/>
				<div className="absolute inset-y-px right-px flex w-8 flex-col overflow-hidden rounded-r-[7px] border-line border-l">
					<NumberField.Increment className={STEPPER} aria-label="Aumentar">
						<CaretUp size={10} weight="bold" aria-hidden="true" />
					</NumberField.Increment>
					<NumberField.Decrement
						className={cn(STEPPER, "border-line border-t")}
						aria-label="Diminuir"
					>
						<CaretDown size={10} weight="bold" aria-hidden="true" />
					</NumberField.Decrement>
				</div>
			</NumberField.Group>
		</NumberField.Root>
	);
}

function numberOf(value: string) {
	const parsed = Number(value);
	return value.trim() === "" || Number.isNaN(parsed) ? null : parsed;
}
