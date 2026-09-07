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
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-[12px] font-medium text-muted">
				{label}
				{required ? <span className="text-danger"> *</span> : null}
			</label>
			{children(id)}
			{error ? (
				<span className="text-[11.5px] text-danger">{error}</span>
			) : null}
			{hint && !error ? (
				<span className="text-[11.5px] text-faint">{hint}</span>
			) : null}
		</div>
	);
}

type InputProps = React.ComponentProps<"input">;

export function TextInput({ className, ...rest }: InputProps) {
	return <input className={cn(CONTROL, className)} {...rest} />;
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

type CheckboxProps = Omit<InputProps, "type"> & { label: React.ReactNode };

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
	return (
		<label
			className={cn(
				"flex items-start gap-2.5 text-[12.5px] text-ink",
				className,
			)}
		>
			<input
				type="checkbox"
				className="mt-0.5 h-4 w-4 accent-[#1d9e75]"
				{...rest}
			/>
			<span>{label}</span>
		</label>
	);
}
