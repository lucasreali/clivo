import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Check } from "@phosphor-icons/react";
import { useId } from "react";
import { cn } from "./cn";
import { CONTROL } from "./control";

type FieldProps = {
	label: string;
	required?: boolean;
	hint?: string;
	error?: string;
	children: (id: string) => React.ReactNode;
};

export function Field({ label, required, hint, error, children }: FieldProps) {
	const id = useId();

	return (
		<FieldPrimitive.Root
			invalid={Boolean(error)}
			className="flex flex-col gap-1.5"
		>
			<FieldPrimitive.Label
				htmlFor={id}
				className="font-medium text-[12px] text-muted"
			>
				{label}
				{required ? <span className="text-danger"> *</span> : null}
			</FieldPrimitive.Label>
			{children(id)}
			{error ? (
				<FieldPrimitive.Error match className="text-[11.5px] text-danger">
					{error}
				</FieldPrimitive.Error>
			) : null}
			{hint && !error ? (
				<FieldPrimitive.Description className="text-[11.5px] text-faint">
					{hint}
				</FieldPrimitive.Description>
			) : null}
		</FieldPrimitive.Root>
	);
}

type InputProps = React.ComponentProps<"input">;

export function TextInput({ className, ...rest }: InputProps) {
	return <Input className={cn(CONTROL, className)} {...rest} />;
}

type TextAreaProps = React.ComponentProps<"textarea">;

export function TextArea({ className, ...rest }: TextAreaProps) {
	return (
		<textarea
			className={cn(
				CONTROL,
				"h-auto min-h-[76px] py-2 leading-relaxed",
				className,
			)}
			{...rest}
		/>
	);
}

type CheckboxProps = {
	label: React.ReactNode;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	name?: string;
	disabled?: boolean;
	onBlur?: () => void;
	className?: string;
};

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: the control is the hidden input Checkbox.Root renders for the label to reach.
		<label
			className={cn(
				"flex items-start gap-2.5 text-[12.5px] text-ink",
				className,
			)}
		>
			<CheckboxPrimitive.Root
				{...rest}
				className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-line bg-panel text-white data-checked:border-brand data-checked:bg-brand data-disabled:bg-surface"
			>
				<CheckboxPrimitive.Indicator className="flex data-unchecked:hidden">
					<Check size={11} weight="bold" aria-hidden="true" />
				</CheckboxPrimitive.Indicator>
			</CheckboxPrimitive.Root>
			<span>{label}</span>
		</label>
	);
}
