import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import {
	Checkbox,
	Field,
	Select,
	TextArea,
	TextInput,
} from "#/shared/ui/Field";

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
	children: React.ReactNode;
};

export function FormSelectField<TValues extends FieldValues>({
	control,
	name,
	label,
	required,
	hint,
	disabled,
	children,
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
							id={id}
							name={field.name}
							ref={field.ref}
							disabled={disabled}
							value={field.value ?? ""}
							onBlur={field.onBlur}
							onChange={field.onChange}
							aria-invalid={fieldState.invalid}
						>
							{children}
						</Select>
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
