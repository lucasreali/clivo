import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { Combobox } from "#/shared/ui/Combobox";
import { Checkbox, Field, TextArea, TextInput } from "#/shared/ui/Field";
import type { Option } from "#/shared/ui/options";
import { Select } from "#/shared/ui/Select";

type FieldProps<TValues extends FieldValues> = {
	control: Control<TValues>;
	name: Path<TValues>;
	label: string;
	required?: boolean;
	hint?: string;
	disabled?: boolean;
};

type TextFieldProps<TValues extends FieldValues> = FieldProps<TValues> & {
	type?: React.HTMLInputTypeAttribute;
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
	autoComplete?: string;
	placeholder?: string;
	maxLength?: number;
	/** Rewrites what the typist sees on every keystroke, e.g. a CPF mask. */
	mask?: (value: string) => string;
};

export function FormTextField<TValues extends FieldValues>({
	control,
	name,
	label,
	required,
	hint,
	disabled,
	mask,
	...input
}: TextFieldProps<TValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field
					label={label}
					required={required}
					hint={hint}
					error={fieldState.error?.message}
				>
					{(id) => (
						<TextInput
							{...input}
							id={id}
							name={field.name}
							ref={field.ref}
							disabled={disabled}
							value={field.value ?? ""}
							onBlur={field.onBlur}
							onChange={(event) =>
								field.onChange(
									mask ? mask(event.target.value) : event.target.value,
								)
							}
							aria-invalid={fieldState.invalid}
						/>
					)}
				</Field>
			)}
		/>
	);
}

type TextAreaFieldProps<TValues extends FieldValues> = FieldProps<TValues> & {
	maxLength?: number;
	placeholder?: string;
};

export function FormTextAreaField<TValues extends FieldValues>({
	control,
	name,
	label,
	required,
	hint,
	disabled,
	...input
}: TextAreaFieldProps<TValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field
					label={label}
					required={required}
					hint={hint}
					error={fieldState.error?.message}
				>
					{(id) => (
						<TextArea
							{...input}
							id={id}
							name={field.name}
							ref={field.ref}
							disabled={disabled}
							value={field.value ?? ""}
							onBlur={field.onBlur}
							onChange={field.onChange}
							aria-invalid={fieldState.invalid}
						/>
					)}
				</Field>
			)}
		/>
	);
}

type SelectFieldProps<TValues extends FieldValues> = FieldProps<TValues> & {
	options: readonly Option[];
	placeholder?: string;
};

export function FormSelectField<TValues extends FieldValues>({
	control,
	name,
	label,
	required,
	hint,
	disabled,
	...select
}: SelectFieldProps<TValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field
					label={label}
					required={required}
					hint={hint}
					error={fieldState.error?.message}
				>
					{(id) => (
						<Select
							{...select}
							id={id}
							name={field.name}
							ref={field.ref}
							disabled={disabled}
							value={field.value ?? ""}
							onBlur={field.onBlur}
							onChange={field.onChange}
							aria-invalid={fieldState.invalid}
						/>
					)}
				</Field>
			)}
		/>
	);
}

type CheckboxFieldProps<TValues extends FieldValues> = Omit<
	FieldProps<TValues>,
	"label" | "required" | "hint"
> & {
	label: React.ReactNode;
};

export function FormCheckboxField<TValues extends FieldValues>({
	control,
	name,
	label,
	disabled,
}: CheckboxFieldProps<TValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<div className="flex flex-col gap-1.5">
					<Checkbox
						name={field.name}
						ref={field.ref}
						disabled={disabled}
						checked={Boolean(field.value)}
						onBlur={field.onBlur}
						onChange={(event) => field.onChange(event.target.checked)}
						label={label}
					/>
					{fieldState.error ? (
						<span className="text-[11.5px] text-danger">
							{fieldState.error.message}
						</span>
					) : null}
				</div>
			)}
		/>
	);
}

type ComboboxFieldProps<TValues extends FieldValues> = FieldProps<TValues> & {
	options: readonly Option[];
	onSearch?: (term: string) => void;
	placeholder?: string;
	emptyMessage?: string;
	isLoading?: boolean;
};

export function FormComboboxField<TValues extends FieldValues>({
	control,
	name,
	label,
	required,
	hint,
	disabled,
	...combobox
}: ComboboxFieldProps<TValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field
					label={label}
					required={required}
					hint={hint}
					error={fieldState.error?.message}
				>
					{(id) => (
						<Combobox
							{...combobox}
							id={id}
							name={field.name}
							ref={field.ref}
							disabled={disabled}
							value={field.value ?? ""}
							onBlur={field.onBlur}
							onChange={field.onChange}
						/>
					)}
				</Field>
			)}
		/>
	);
}
